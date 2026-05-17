/**
 * Sidebar Navigation Configuration
 *
 * Defines the structure and content of the sidebar navigation menu.
 * Supports multiple navigation component types from CoreUI React:
 * - CNavItem: Single navigation link
 * - CNavGroup: Collapsible group of links
 * - CNavTitle: Section title/divider
 *
 * @module _nav
 */

import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilSettings,
  cilWarning,
  cilChartLine,
  cilCloudUpload,
  cilBell,
  cilFile,
  cilCheckCircle,
  cilTask,
  cilPeople,
} from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

/**
 * Navigation menu structure array
 *
 * @type {Array<Object>}
 * @property {React.ComponentType} component - CoreUI nav component (CNavItem, CNavGroup, CNavTitle)
 * @property {string} name - Display text for the nav item
 * @property {string} [to] - Internal route path (for CNavItem with routing)
 * @property {string} [href] - External URL (for CNavItem with external links)
 * @property {React.ReactNode} [icon] - Icon element to display
 * @property {Object} [badge] - Optional badge configuration
 * @property {string} badge.color - Badge color (info, danger, success, etc.)
 * @property {string} badge.text - Badge text content
 * @property {Array<Object>} [items] - Child items for CNavGroup
 *
 * @example
 * // Simple navigation item
 * {
 *   component: CNavItem,
 *   name: 'Dashboard',
 *   to: '/dashboard',
 *   icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
 * }
 *
 * @example
 * // Navigation group with children
 * {
 *   component: CNavGroup,
 *   name: 'Base',
 *   to: '/base',
 *   icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
 *   items: [
 *     {
 *       component: CNavItem,
 *       name: 'Cards',
 *       to: '/base/cards',
 *     },
 *   ],
 * }
 *
 * @example
 * // Section title
 * {
 *   component: CNavTitle,
 *   name: 'Theme',
 * }
 */
const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'success',
      text: 'KPI',
    },
  },
  {
    component: CNavTitle,
    name: 'Gestion',
  },
  {
    component: CNavItem,
    name: 'Machines',
    to: '/machines',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Pannes',
    to: '/pannes',
    icon: <CIcon icon={cilWarning} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Analyse',
  },
  {
    component: CNavItem,
    name: 'Analytics',
    to: '/analytics',
    icon: <CIcon icon={cilChartLine} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Évolution KPI',
    to: '/evolution',
    icon: <CIcon icon={cilChartLine} customClassName="nav-icon" />,
    badge: {
      color: 'success',
      text: 'NEW',
    },
  },
  {
    component: CNavItem,
    name: 'Alertes',
    to: '/alertes',
    icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
    badge: {
      color: 'danger',
      text: '!',
    },
  },
  {
    component: CNavTitle,
    name: 'Configuration',
  },
  {
    component: CNavItem,
    name: 'Objectifs KPI',
    to: '/objectifs',
    icon: <CIcon icon={cilCheckCircle} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Actions Correctives',
    to: '/actions-correctives',
    icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
    badge: {
      color: 'success',
      text: 'NEW',
    },
  },
  {
    component: CNavTitle,
    name: 'Données',
  },
  {
    component: CNavItem,
    name: 'Import Excel',
    to: '/import',
    icon: <CIcon icon={cilCloudUpload} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Rapports',
    to: '/rapports',
    icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Administration',
  },
  {
    component: CNavItem,
    name: 'Utilisateurs',
    to: '/users',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    badge: {
      color: 'danger',
      text: 'ADMIN',
    },
  },
]

export default _nav
