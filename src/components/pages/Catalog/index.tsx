import React, { ReactElement } from 'react'
import styles from './index.module.css'
import CatalogAll from './CatalogAll'

export default function PageCatalog(): ReactElement {
  const url = new URL(window.location.href)
  // const defaultTab = url.searchParams.get('defaultTab')
  return (
    <article className={styles.content}>
      <CatalogAll />
    </article>
  )
}
