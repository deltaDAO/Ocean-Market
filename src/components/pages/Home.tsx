import React, { Key, ReactElement } from 'react'
import Permission from '../organisms/Permission'
import styles from './Home.module.css'
import { ResourceTeaser } from '../molecules/ResourceTeaser'
import { graphql, useStaticQuery } from 'gatsby'

export interface Resource {
  title: string
  desc: string
  url: string
}

export const contentQuery = graphql`
  query mvgResourcesQuery {
    content: allFile(
      filter: { relativePath: { eq: "pages/mvgResources.json" } }
    ) {
      edges {
        node {
          childPagesJson {
            resources {
              title
              desc
              url
            }
          }
        }
      }
    }
  }
`

export default function HomePage(): ReactElement {
  const data = useStaticQuery(contentQuery)
  const { resources } = data.content.edges[0].node.childPagesJson
  return (
    <Permission eventType="browse">
      <div className={styles.resourceList}>
        {resources?.map((e: Resource, i: Key) => (
          <ResourceTeaser key={i} {...e} />
        ))}
      </div>
    </Permission>
  )
}
