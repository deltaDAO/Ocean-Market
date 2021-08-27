import React, { ReactElement } from 'react'
import Table from '../atoms/Table'
import Price from '../atoms/Price'
import Tooltip from '../atoms/Tooltip'
import AssetTitle from './AssetListTitle'
import AssetType from '../atoms/AssetType'
import { AssetListPrices } from '../../utils/subgraph'

const columns = [
  {
    name: 'Data Set',
    selector: function getAssetRow(row: AssetListPrices) {
      const { attributes } = row.ddo.findServiceByType('metadata')
      return <AssetTitle title={attributes.main.name} ddo={row.ddo} />
    },
    maxWidth: '45rem',
    grow: 2
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
      const { attributes } = row.ddo.findServiceByType('metadata')
      const isCompute = Boolean(row.ddo.findServiceByType('compute'))
      const accessType = isCompute ? 'compute' : 'access'
      return <AssetType type={attributes.main.type} accessType={accessType} />
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

export default function CatalogTable({
  assetsWithPrices
}: {
  assetsWithPrices: AssetListPrices[]
}): ReactElement {
  return (
    <Table
      columns={columns}
      data={assetsWithPrices}
      paginationPerPage={assetsWithPrices.length}
      noTableHead
    />
  )
}
