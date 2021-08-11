import React, { ReactElement } from 'react'
import styles from './index.module.css'
import CatalogAll from './CatalogAll'

export default function PageCatalog(): ReactElement {
  return (
    <article className={styles.content}>
      <CatalogAll />
    </article>
  )
}
