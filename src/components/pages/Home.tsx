import React, { ReactElement, useEffect, useState } from 'react'
import AssetList from '../organisms/AssetList'
import {
  QueryResult,
  SearchQuery
} from '@oceanprotocol/lib/dist/node/metadatacache/MetadataCache'
import Button from '../atoms/Button'
import Bookmarks from '../molecules/Bookmarks'
import axios from 'axios'
import {
  queryMetadata,
  transformChainIdsListToQuery,
  getDynamicPricingQuery
} from '../../utils/aquarius'
import Permission from '../organisms/Permission'
import { DDO, Logger } from '@oceanprotocol/lib'
import { useSiteMetadata } from '../../hooks/useSiteMetadata'
import { useUserPreferences } from '../../providers/UserPreferences'
import styles from './Home.module.css'

function getQueryLatest(chainIds: number[]): SearchQuery {
  return {
    page: 1,
    offset: 9,
    query: {
      query_string: {
        query: `(${transformChainIdsListToQuery(
          chainIds
        )}) ${getDynamicPricingQuery()} AND -isInPurgatory:true `
      }
    },
    sort: { created: -1 }
  }
}

function sortElements(items: DDO[], sorted: string[]) {
  items.sort(function (a, b) {
    return sorted.indexOf(a.dataToken) - sorted.indexOf(b.dataToken)
  })
  return items
}

function SectionQueryResult({
  title,
  query,
  action,
  queryData
}: {
  title: ReactElement | string
  query: SearchQuery
  action?: ReactElement
  queryData?: string
}) {
  const { appConfig } = useSiteMetadata()
  const { chainIds } = useUserPreferences()
  const [result, setResult] = useState<QueryResult>()
  const [loading, setLoading] = useState<boolean>()

  useEffect(() => {
    if (!appConfig.metadataCacheUri) return
    const source = axios.CancelToken.source()

    async function init() {
      if (chainIds.length === 0) {
        const result: QueryResult = {
          results: [],
          page: 0,
          totalPages: 0,
          totalResults: 0
        }
        setResult(result)
        setLoading(false)
      } else {
        try {
          setLoading(true)
          const result = await queryMetadata(query, source.token)
          if (queryData && result.totalResults > 0) {
            const searchDIDs = queryData.split(' ')
            const sortedAssets = sortElements(result.results, searchDIDs)
            const overflow = sortedAssets.length - 9
            sortedAssets.splice(sortedAssets.length - overflow, overflow)
            result.results = sortedAssets
          }
          setResult(result)
          setLoading(false)
        } catch (error) {
          Logger.error(error.message)
        }
      }
    }
    init()

    return () => {
      source.cancel()
    }
  }, [appConfig.metadataCacheUri, query, queryData])

  return (
    <section className={styles.section}>
      <h3>{title}</h3>
      <AssetList
        assets={result?.results}
        showPagination={false}
        isLoading={loading}
      />
      {action && action}
    </section>
  )
}

export default function HomePage(): ReactElement {
  const { chainIds } = useUserPreferences()

  return (
    <Permission eventType="browse">
      <>
        <section className={styles.section}>
          <h3>Bookmarks</h3>
          <Bookmarks />
        </section>

        <SectionQueryResult
          title="Recently Published"
          query={getQueryLatest(chainIds)}
          action={
            <Button style="text" to="/search?sort=created&sortOrder=desc">
              All data sets and algorithms →
            </Button>
          }
        />
      </>
    </Permission>
  )
}
