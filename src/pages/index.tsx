import React, { ReactElement, useState } from 'react'
import { graphql, PageProps } from 'gatsby'
import PageSearch from '../components/templates/Search'
import Page from '../components/templates/Page'
import queryString from 'query-string'
import { accountTruncate } from '../utils/web3'
import ethereumAddress from 'ethereum-address'
import { useSiteMetadata } from '../hooks/useSiteMetadata'
import Styles from '../global/Styles'

export default function PageGatsbyCatalog(props: PageProps): ReactElement {
  const { siteTitle, siteTagline } = useSiteMetadata()

  const parsed = queryString.parse(props.location.search)
  const { text, owner, tags, categories } = parsed
  const [totalResults, setTotalResults] = useState<number>()

  const isETHAddress = ethereumAddress.isAddress(text as string)
  const searchValue =
    (isETHAddress ? accountTruncate(text as string) : text) ||
    tags ||
    categories
  const results = owner
    ? `Published by ${accountTruncate(owner as string)}`
    : `${
        totalResults !== undefined
          ? searchValue && searchValue !== ' '
            ? totalResults === 0
              ? 'No results'
              : totalResults +
                (totalResults > 1 ? ' results' : ' result') +
                ' for ' +
                searchValue
            : totalResults + ' results'
          : 'Searching...'
      }`

  return (
    <Page
      title={siteTitle}
      description={siteTagline}
      uri={props.uri}
      headerCenter
    >
      <h3>{results}</h3>
      <PageSearch
        location={props.location}
        setTotalResults={(totalResults) => setTotalResults(totalResults)}
      />
    </Page>
  )
}
