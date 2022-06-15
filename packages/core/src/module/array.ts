import { shallowReactive } from '@vue/reactivity'
import { isArr } from '@atomic-form/shared'
import type { ElemOf, ExcludeVoidType } from '../type/util'
import type { WatchOptions } from '../watch'
import { watch } from '../watch'
import { buildGetAllChildren, buildNode, spliceArrayChildren } from '../shared/internal'
import type { AtomType, IForm } from '../type/form-type'
import type { FormAtom, FormProps } from './atom'
import { FormAtomBase } from './base'

export class FormAtomArray<
  Value = any,
  ListItem = ElemOf<ExcludeVoidType<Value>>,
  // Array 中获取到的值可能会为 undefined
  ProcessedListItem = ListItem | undefined,
> extends FormAtomBase<Value> {
  children: Array<FormAtomArray | FormAtom>

  constructor(props: FormProps) {
    super(props)
    this.children = shallowReactive([])

    watch(() => this.value.value, (newValue) => {
      if (isArr(newValue)) {
        const valueLen = newValue.length
        const childrenLen = this.children.length
        if (this.children.length !== valueLen) {
          if (valueLen > childrenLen) {
            // add missing children
            spliceArrayChildren(
              this,
              valueLen,
              0,
              ...newValue.slice(childrenLen).map(v => ({ value: v })),
            )
          }
          else {
            // remove extra children
            spliceArrayChildren(this, valueLen, childrenLen)
          }
        }
      }
    }, { immediate: true })
  }

  watchChildren(cb: (val: Array<IForm>) => void, options?: WatchOptions) {
    return watch(
      () => this.children.map(fc => fc.uuid),
      () => {
        cb(this.children)
      },
      options,
    )
  }

  node<Type extends AtomType = 'normal',
  >(path: number, type?: Type): Type extends 'list' ? FormAtomArray<ProcessedListItem> : FormAtom<ProcessedListItem> {
    return buildNode(this, path, type) as any
  }

  get allChildren(): IForm[] {
    return buildGetAllChildren(this)
  }
}
