import React, { ReactElement } from 'react'
import styles from './index.module.css'
import { useUserPreferences } from '../../../providers/UserPreferences'
import Bookmarks from '../../molecules/Bookmarks'

export default function PageCatalog(): ReactElement {
  const url = new URL(window.location.href)
  const defaultTab = url.searchParams.get('defaultTab')
  return <article className={styles.content}>Siema</article>
}
