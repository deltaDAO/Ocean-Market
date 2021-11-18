import React, { ReactElement, useEffect, useState } from 'react'
import styles from './Home.module.css'
import AssetList from '../organisms/AssetList'
import {
  QueryResult,
  SearchQuery
} from '@oceanprotocol/lib/dist/node/metadatacache/MetadataCache'
import Button from '../atoms/Button'
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
import Container from '../atoms/Container'
import HomeIntro from '../organisms/HomeIntro'
import VideoPlayer from '../molecules/VideoPlayer'
import { useAddressConfig } from '../../hooks/useAddressConfig'

function getQueryLatest(
  chainIds: number[],
  featuredAssets: string[]
): SearchQuery {
  const latestQuery = {
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

  const featuredQuery = {
    page: 1,
    offset: featuredAssets.length,
    query: {
      query_string: {
        query: featuredAssets.map((feat) => `id:${feat}`).join(' ')
      }
    },
    sort: { created: 1 }
  }

  const query = featuredAssets.length > 0 ? featuredQuery : latestQuery

  return query
}

function sortElements(items: DDO[], sorted: string[]) {
  items.sort(function (a, b) {
    return sorted.indexOf(a.dataToken) - sorted.indexOf(b.dataToken)
  })
  return items
}

export function SectionQueryResult({
  title,
  query,
  action,
  queryData,
  className,
  assetListClassName
}: {
  title: ReactElement | string
  query: SearchQuery
  action?: ReactElement
  queryData?: string
  className?: string
  assetListClassName?: string
}): ReactElement {
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
    <section className={className || styles.section}>
      <h3>{title}</h3>
      <AssetList
        assets={result?.results}
        showPagination={false}
        isLoading={loading}
        className={assetListClassName}
      />
      {action && action}
    </section>
  )
}

export default function HomePage(): ReactElement {
  const { chainIds } = useUserPreferences()
  const { featured, hasFeaturedAssets } = useAddressConfig()
  return (
    <Permission eventType="browse">
      <>
        <section className={styles.video}>
          <div className={styles.playerWrapper}>
            <VideoPlayer videoUrl="https://youtu.be/R49CXPTRamg" />
          </div>
        </section>
        <section className={styles.intro}>
          <HomeIntro />
        </section>
        <Container>
          <SectionQueryResult
            title={
              hasFeaturedAssets() ? 'Featured Assets' : 'Recently Published'
            }
            query={getQueryLatest(chainIds, featured)}
            action={
              <Button style="text" to="/search?sort=created&sortOrder=desc">
                All data sets and algorithms →
              </Button>
            }
          />
        </Container>
      </>
    </Permission>
  )
}
