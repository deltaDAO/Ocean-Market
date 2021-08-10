import { useUserPreferences } from '../../../providers/UserPreferences'
import React, { ReactElement, useEffect, useState } from 'react'
import Table from '../../atoms/Table'
import { Logger } from '@oceanprotocol/lib'
import { useAsset } from '../../../providers/Asset'
import Price from '../../atoms/Price'
import AssetType from '../../atoms/AssetType'
import Tooltip from '../../atoms/Tooltip'
import AssetTitle from '../../molecules/AssetListTitle'
import {
  queryMetadata,
  transformChainIdsListToQuery
} from '../../../utils/aquarius'
import { getAssetsBestPrices, AssetListPrices } from '../../../utils/subgraph'
import axios, { CancelToken } from 'axios'
import { useSiteMetadata } from '../../../hooks/useSiteMetadata'

async function getAssets(
  catalog: string[],
  chainIds: number[],
  cancelToken: CancelToken
) {
  const searchDids = JSON.stringify(catalog)
    .replace(/,/g, ' ')
    .replace(/"/g, '')
    .replace(/(\[|\])/g, '')
    // for whatever reason ddo.id is not searchable, so use ddo.dataToken instead
    .replace(/(did:op:)/g, '0x')

  const queryCatalog = {
    cancelToken: { promise: {} },
    page: 1,
    offset: 9,
    query: {
      query_string: {
        query: `(${searchDids}) AND (${transformChainIdsListToQuery(
          chainIds
        )})`,
        fields: ['dataToken'],
        default_operator: 'OR'
      }
    },
    sort: { created: -1 }
  }

  try {
    const result = await queryMetadata(queryCatalog, cancelToken)

    return result
  } catch (error) {
    Logger.error(error.message)
  }
}
export default function CatalogAll(): ReactElement {
  const { ddo, type } = useAsset()
  const isCompute = Boolean(ddo?.findServiceByType('compute'))
  const accessType = isCompute ? 'compute' : 'access'
  const columns = [
    {
      name: 'Data Set',
      selector: function getAssetRow(row: AssetListPrices) {
        const { attributes } = row.ddo.findServiceByType('metadata')
        return <AssetTitle title={attributes.main.name} ddo={row.ddo} />
      },
      maxWidth: '45rem',
      grow: 1
    },
    {
      name: 'Datatoken Symbol',
      selector: function getAssetRow(row: AssetListPrices) {
        return (
          <Tooltip content={row.ddo.dataTokenInfo.name}>
            {row.ddo.dataTokenInfo.symbol}
          </Tooltip>
        )
      },
      maxWidth: '10rem'
    },
    {
      name: 'Asset Type',
      selector: function getAssetRow(row: AssetListPrices) {
        return <AssetType type={type} accessType={accessType} />
      },
      maxWidth: '10rem'
    },
    {
      name: 'Price',
      selector: function getAssetRow(row: AssetListPrices) {
        return <Price price={row.price} small />
      },
      right: true
    }
  ]

  const { appConfig } = useSiteMetadata()
  const { bookmarks } = useUserPreferences()

  const [pinned, setPinned] = useState<AssetListPrices[]>()
  const [isLoading, setIsLoading] = useState<boolean>()
  const { chainIds } = useUserPreferences()

  useEffect(() => {
    if (!appConfig.metadataCacheUri || bookmarks === []) return

    const source = axios.CancelToken.source()

    async function init() {
      if (!bookmarks?.length) {
        setPinned([])
        return
      }

      setIsLoading(true)

      try {
        const resultPinned = await getAssets(bookmarks, chainIds, source.token)
        const pinnedAssets: AssetListPrices[] = await getAssetsBestPrices(
          resultPinned?.results
        )
        setPinned(pinnedAssets)
      } catch (error) {
        Logger.error(error.message)
      }

      setIsLoading(false)
    }
    init()

    return () => {
      source.cancel()
    }
  }, [bookmarks, chainIds])

  return (
    <Table
      columns={columns}
      data={pinned}
      isLoading={isLoading}
      emptyMessage="Your catalog will appear here."
      noTableHead
    />
  )
}
