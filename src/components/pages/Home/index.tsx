import React, { ReactElement, useEffect, useState } from 'react'
import AssetList from '../../organisms/AssetList'
import Button from '../../atoms/Button'
import {
  generateBaseQuery,
  getFilterTerm,
  queryMetadata
} from '../../../utils/aquarius'
import Permission from '../../organisms/Permission'
import { DDO, Logger } from '@oceanprotocol/lib'
import { useUserPreferences } from '../../../providers/UserPreferences'
import styles from './index.module.css'
import { useIsMounted } from '../../../hooks/useIsMounted'
import { useCancelToken } from '../../../hooks/useCancelToken'
import { SearchQuery } from '../../../models/aquarius/SearchQuery'
import {
  SortDirectionOptions,
  SortOptions,
  SortTermOptions
} from '../../../models/SortAndFilters'
import { useAddressConfig } from '../../../hooks/useAddressConfig'
import { BaseQueryParams } from '../../../models/aquarius/BaseQueryParams'
import { PagedAssets } from '../../../models/PagedAssets'
import Header from './Header'
import Boxes from './Boxes'
import Topic, { TTopic } from './Topic'
import { graphql, useStaticQuery } from 'gatsby'
import { ReactComponent as Education } from '../../../images/education.svg'
import { ReactComponent as DataEconomy } from '../../../images/data_economy.svg'

const topicQuery = graphql`
  query TopicQuery {
    file(relativePath: { eq: "pages/home/topics.json" }) {
      childHomeJson {
        topics {
          svg
          title
          content
          cta {
            call
            action
          }
        }
      }
    }
  }
`

const topicSvgMap = {
  education: <Education />,
  data_economy: <DataEconomy />
}

function sortElements(items: DDO[], sorted: string[]) {
  items.sort(function (a, b) {
    return (
      sorted.indexOf(a.dataToken.toLowerCase()) -
      sorted.indexOf(b.dataToken.toLowerCase())
    )
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
  queryData?: string[]
}) {
  const { chainIds } = useUserPreferences()
  const [result, setResult] = useState<any>()
  const [loading, setLoading] = useState<boolean>()
  const isMounted = useIsMounted()
  const newCancelToken = useCancelToken()
  useEffect(() => {
    async function init() {
      if (chainIds.length === 0) {
        const result: PagedAssets = {
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
          const result = await queryMetadata(query, newCancelToken())
          if (!isMounted()) return
          if (queryData && result?.totalResults > 0) {
            const sortedAssets = sortElements(result.results, queryData)
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
  }, [chainIds.length, isMounted, newCancelToken, query, queryData])

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
  const [queryLatest, setQueryLatest] = useState<SearchQuery>()
  const { chainIds } = useUserPreferences()
  const { featured, hasFeaturedAssets } = useAddressConfig()

  const data = useStaticQuery(topicQuery)
  const { topics } = data.file.childHomeJson

  useEffect(() => {
    const queryParams = {
      esPaginationOptions: {
        size: hasFeaturedAssets() ? featured.length : 9
      },
      filters: hasFeaturedAssets() ? [getFilterTerm('id', featured)] : undefined
    }

    const baseParams = {
      ...queryParams,
      chainIds: chainIds,
      sortOptions: {
        sortBy: SortTermOptions.Created,
        sortDirection: SortDirectionOptions.Ascending
      } as SortOptions
    } as BaseQueryParams

    const latestOrFeaturedQuery = generateBaseQuery(baseParams)

    setQueryLatest(latestOrFeaturedQuery)
  }, [chainIds])

  return (
    <>
      <Header />
      <Boxes />
      {(topics as TTopic[]).map((topic, i) => (
        <Topic
          key={topic.title}
          svgComponent={topicSvgMap[topic.svg]}
          topic={topic}
          mirror={i % 2 === 1}
        />
      ))}
      <Permission eventType="browse">
        <>
          {queryLatest && (
            <SectionQueryResult
              title={
                hasFeaturedAssets() ? 'Featured Assets' : 'Recently Published'
              }
              query={queryLatest}
              action={
                <Button style="text" to="/search?sort=created&sortOrder=desc">
                  All data sets and algorithms →
                </Button>
              }
            />
          )}
        </>
      </Permission>
    </>
  )
}
