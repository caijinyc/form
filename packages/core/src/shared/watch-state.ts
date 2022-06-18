import { isFn, isPlainObj } from '@atomic-form/shared'
import type { StopFun, WatchStateOptions } from '../type/form-type'
import { watch } from '../watch'
import type { FormAtomBase } from '../module/base'
import type { IStateType } from './get-state'
import { getState } from './get-state'
import { buildLazyCallback } from './index'

const DEFAULT_OPTIONS: WatchStateOptions = {
  compare: true,
}

export const buildWatchStateChange = (form: FormAtomBase, ...params: any): StopFun => {
  const stateType: IStateType | IStateType[] = isFn(params[0]) ? undefined : params[0]
  const options: WatchStateOptions = {
    ...DEFAULT_OPTIONS,
    ...(isPlainObj(params[1]) ? params[1] : isPlainObj(params[2]) ? params[2] : {}),
  }

  // batch update at the same time will emit callback function only once
  const originCb = isFn(params[0]) ? params[0] : params[1]
  const cb = originCb

  let source: () => any

  if (stateType) {
    source = () => getState(form, stateType)
  }
  else {
    source = () => {
      return getState(form)
    }
  }

  return watch(source, cb, { deep: true, immediate: options.immediate, flush: options.sync ? 'sync' : 'pre' })
}
