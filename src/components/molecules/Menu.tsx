import React, { ReactElement } from 'react'
import { Link } from 'gatsby'
import { useLocation } from '@reach/router'
import loadable from '@loadable/component'
import styles from './Menu.module.css'
import { useSiteMetadata } from '../../hooks/useSiteMetadata'
import UserPreferences from './UserPreferences'
import Badge from '../atoms/Badge'
import Logo from '../atoms/Logo'
import Networks from './UserPreferences/Networks'
import SearchBar from './SearchBar'

export default function Menu(): ReactElement {
  const { siteTitle } = useSiteMetadata()

  return (
    <nav className={styles.menu}>
      <Link to="/" className={styles.logo}>
        <Logo branding />
        <h1 className={styles.title}>{siteTitle}</h1>
      </Link>
      <div className={styles.actions}>
        <UserPreferences />
      </div>
    </nav>
  )
}
