// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2024-Present The UDS Authors

import type { CoreV1Event as Resource } from '@kubernetes/client-node'

import { ResourceStore, transformResource } from '../store'
import { type ColumnWrapper, type CommonRow, type ResourceStoreInterface } from '../types'

export interface Row extends CommonRow {
  count: number
  message: string
  object_kind: string
  object_name: string
  reason: string
  type: string
}

export type Columns = ColumnWrapper<Row>

export function createStore(): ResourceStoreInterface<Resource, Row> {
  const url = `/api/v1/resources/events`

  const transform = transformResource<Resource, Row>((r) => ({
    count: r.count ?? 0,
    message: r.message ?? '',
    object_kind: r.involvedObject?.kind ?? '',
    object_name: r.involvedObject?.name ?? '',
    reason: r.reason ?? '',
    type: r.type ?? '',
    // A bit of a hack, but use the last seen timestamp to track age
    creationTimestamp: new Date(r.metadata.creationTimestamp ?? ''),
  }))

  const store = new ResourceStore<Resource, Row>('age', false)

  return {
    ...store,
    start: () => store.start(url, transform),
    sortByKey: store.sortByKey.bind(store),
  }
}
