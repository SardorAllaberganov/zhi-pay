/**
 * i18n stub — returns English strings for v1.
 * Structure ready for ru/uz JSON files later.
 *
 * Key convention: admin.<page>.<element>
 *   admin.kyc-queue.empty.title
 *   admin.transfers.column.amount
 *   common.errors.LIMIT_DAILY_EXCEEDED.title
 */

const EN: Record<string, string> = {
  // common
  'common.app.name': 'ZhiPay Admin',

  // shared date-range picker
  'common.daterange.title': 'Select date range',
  'common.daterange.quick-select': 'Quick select',
  'common.daterange.today': 'Today',
  'common.daterange.yesterday': 'Yesterday',
  'common.daterange.7d': 'Last 7 days',
  'common.daterange.30d': 'Last 30 days',
  'common.daterange.custom': 'Custom range',
  'common.daterange.cancel': 'Cancel',
  'common.daterange.apply': 'Apply',

  'common.actions.search': 'Search transfers, users, cards…',
  'common.actions.cancel': 'Cancel',
  'common.actions.confirm': 'Confirm',
  'common.actions.approve': 'Approve',
  'common.actions.reject': 'Reject',
  'common.actions.escalate': 'Escalate',
  'common.actions.clear': 'Clear',
  'common.actions.retry': 'Try again',
  'common.actions.signout': 'Sign out',
  'common.actions.help': 'Help',
  'common.actions.theme.light': 'Light',
  'common.actions.theme.dark': 'Dark',
  'common.actions.theme.system': 'System',
  'common.actions.theme.toggle': 'Toggle theme',
  'common.actions.notifications': 'Notifications',
  'common.actions.usermenu': 'Account menu',

  // navigation sections
  'admin.nav.section.operations': 'Operations',
  'admin.nav.section.customers': 'Customers',
  'admin.nav.section.finance': 'Finance',
  'admin.nav.section.compliance': 'Compliance',
  'admin.nav.section.system': 'System',
  'admin.nav.section.content': 'Content',

  // navigation items
  'admin.nav.overview': 'Overview',
  'admin.nav.transfers': 'Transfers',
  'admin.nav.kyc-queue': 'KYC Queue',
  'admin.nav.aml-triage': 'AML Triage',
  'admin.nav.users': 'Users',
  'admin.nav.cards': 'Cards',
  'admin.nav.recipients': 'Recipients',
  'admin.nav.fx-config': 'FX Config',
  'admin.nav.commission-rules': 'Commission Rules',
  'admin.nav.audit-log': 'Audit Log',
  'admin.nav.blacklist': 'Blacklist',
  'admin.nav.kyc-tiers': 'KYC Tiers',
  'admin.nav.services': 'Services & Health',
  'admin.nav.app-versions': 'App Versions',
  'admin.nav.error-codes': 'Error Codes',
  'admin.nav.stories': 'Stories',
  'admin.nav.news': 'News',
  'admin.nav.notifications': 'Notifications',

  // overview page
  'admin.overview.title': 'Overview',
  'admin.overview.subtitle': 'Real-time view of ZhiPay operations',
  'admin.overview.refresh': 'Refresh',
  'admin.overview.refreshed-at': 'Updated {time}',

  'admin.overview.range.today': 'Today',
  'admin.overview.range.yesterday': 'Yesterday',
  'admin.overview.range.7d': 'Last 7 days',
  'admin.overview.range.30d': 'Last 30 days',

  'admin.overview.kpi.transfers-today': 'Transfers today',
  'admin.overview.kpi.volume-today': 'Volume today',
  'admin.overview.kpi.pending-kyc': 'Pending KYC',
  'admin.overview.kpi.open-aml': 'Open AML flags',
  'admin.overview.kpi.delta.up': 'vs yesterday',
  'admin.overview.kpi.delta.down': 'vs yesterday',

  'admin.overview.status-breakdown.title': 'Status breakdown',
  'admin.overview.status-breakdown.subtitle': 'Selected period',
  'admin.overview.status-breakdown.total': 'Total',
  'admin.overview.status-breakdown.empty': 'No data yet',

  'admin.overview.throughput.title': 'Throughput',
  'admin.overview.throughput.subtitle': 'Last 60 minutes — transfers per minute',
  'admin.overview.throughput.empty': 'No transfers in the last 60 minutes',
  'admin.overview.throughput.empty-period': 'No transfers in this period',

  'admin.overview.fx-health.title': 'FX spread health',
  'admin.overview.fx-health.subtitle': 'Live UZS / CNY rate',
  'admin.overview.fx-health.rate-label': 'Rate',
  'admin.overview.fx-health.mid-rate': 'Mid rate',
  'admin.overview.fx-health.spread': 'Spread',
  'admin.overview.fx-health.source': 'Source',
  'admin.overview.fx-health.valid-from': 'Valid from',
  'admin.overview.fx-health.ttl': 'Expires in',
  'admin.overview.fx-health.expired': 'Expired',
  'admin.overview.fx-health.update-rate': 'Update rate',
  'admin.overview.fx-health.badge.healthy': 'Healthy',
  'admin.overview.fx-health.badge.drifting': 'Drifting',
  'admin.overview.fx-health.badge.stale': 'Stale',
  'admin.overview.fx-health.source.central_bank': 'Central Bank of Uzbekistan',
  'admin.overview.fx-health.source.provider_x': 'Provider X',

  'admin.overview.services.title': 'Services & health',
  'admin.overview.services.subtitle': 'Live status of payment rails',
  'admin.overview.services.last-checked': 'Last checked {time}',
  'admin.overview.services.status.active': 'Active',
  'admin.overview.services.status.maintenance': 'Maintenance',
  'admin.overview.services.status.disabled': 'Disabled',

  'admin.overview.recent-activity.title': 'Recent activity',
  'admin.overview.recent-activity.subtitle': 'Latest 20 transfers',
  'admin.overview.recent-activity.column.time': 'Time',
  'admin.overview.recent-activity.column.card': 'Card',
  'admin.overview.recent-activity.column.sender': 'Sender',
  'admin.overview.recent-activity.column.recipient': 'Recipient',
  'admin.overview.recent-activity.column.amount-uzs': 'Amount UZS',
  'admin.overview.recent-activity.column.amount-cny': 'Amount CNY',
  'admin.overview.recent-activity.column.status': 'Status',
  'admin.overview.recent-activity.view-all': 'View all transfers',
  'admin.overview.recent-activity.row-action': 'View',
  'admin.overview.recent-activity.total': 'Total',
  'admin.overview.recent-activity.total.count': '{count} transfers',
  'admin.overview.recent-activity.empty.title': 'No activity yet',
  'admin.overview.recent-activity.empty.body':
    'Transfers will appear here in real time as soon as they start flowing.',

  'admin.overview.empty.title': 'No data yet',
  'admin.overview.empty.body':
    'Once transfers start flowing for this period, KPIs and charts will populate here.',

  'admin.overview.error.title': 'Realtime feed unavailable',
  'admin.overview.error.body': 'Showing last cached data from {time}.',
  'admin.overview.error.retry': 'Retry',
  'admin.overview.error.stale': 'Stale',

  'admin.overview.destination.alipay': 'Alipay',
  'admin.overview.destination.wechat': 'WeChat Pay',

  // transfers — list page
  'admin.transfers.title': 'Transfers',
  'admin.transfers.count': '{count} transfers',
  'admin.transfers.export': 'Export CSV',
  'admin.transfers.saved-filters': 'Saved filters',
  'admin.transfers.saved-filters.save': 'Save current filter…',
  'admin.transfers.saved-filters.empty': 'No saved filters yet',
  'admin.transfers.saved-filters.save-disabled-hint': 'Apply at least one filter to save',
  'admin.transfers.saved-filters.dialog.save-title': 'Save current filter',
  'admin.transfers.saved-filters.dialog.rename-title': 'Rename saved filter',
  'admin.transfers.saved-filters.dialog.save-description':
    'Give this filter a name so you can recall it later.',
  'admin.transfers.saved-filters.dialog.rename-description':
    'Choose a new name for this saved filter.',
  'admin.transfers.saved-filters.dialog.name-label': 'Name',
  'admin.transfers.saved-filters.dialog.name-placeholder': 'e.g. Failed today',
  'admin.transfers.saved-filters.dialog.cancel': 'Cancel',
  'admin.transfers.saved-filters.dialog.save': 'Save',
  'admin.transfers.saved-filters.dialog.rename': 'Rename',
  'admin.transfers.saved-filters.actions.label': 'Saved filter actions',
  'admin.transfers.saved-filters.actions.apply': 'Apply',
  'admin.transfers.saved-filters.actions.rename': 'Rename',
  'admin.transfers.saved-filters.actions.delete': 'Delete',
  'admin.transfers.search-placeholder':
    'Search by transfer ID, phone, masked PAN, recipient handle…',

  // transfers — filters
  'admin.transfers.filter.status': 'Status',
  'admin.transfers.filter.date-range': 'Date range',
  'admin.transfers.filter.destination': 'Destination',
  'admin.transfers.filter.scheme': 'Scheme',
  'admin.transfers.filter.amount': 'Amount',
  'admin.transfers.filter.amount-min': 'Min UZS',
  'admin.transfers.filter.amount-max': 'Max UZS',
  'admin.transfers.filter.tier': 'Tier',
  'admin.transfers.filter.has-aml': 'Has AML flag',
  'admin.transfers.filter.has-failure': 'Has failure code',
  'admin.transfers.filter.clear-all': 'Clear all',
  'admin.transfers.filter.apply': 'Apply',
  'admin.transfers.filter.mobile-button': 'Filters',

  'admin.transfers.range.today': 'Today',
  'admin.transfers.range.yesterday': 'Yesterday',
  'admin.transfers.range.7d': 'Last 7 days',
  'admin.transfers.range.30d': 'Last 30 days',
  'admin.transfers.range.custom': 'Custom range',
  'admin.transfers.range.from': 'From',
  'admin.transfers.range.to': 'To',

  'admin.transfers.scheme.uzcard': 'UzCard',
  'admin.transfers.scheme.humo': 'Humo',
  'admin.transfers.scheme.visa': 'Visa',
  'admin.transfers.scheme.mastercard': 'Mastercard',

  'admin.transfers.quick.failed-today': 'Failed today ({count})',
  'admin.transfers.quick.reversed-7d': 'Reversed last 7d ({count})',
  'admin.transfers.quick.stuck': 'Stuck processing > 10min ({count})',

  // transfers — table columns
  'admin.transfers.column.created': 'Created',
  'admin.transfers.column.transfer-id': 'Transfer ID',
  'admin.transfers.column.card': 'Card',
  'admin.transfers.column.sender': 'Sender',
  'admin.transfers.column.recipient': 'Recipient',
  'admin.transfers.column.amount-uzs': 'Amount UZS',
  'admin.transfers.column.amount-cny': 'Amount CNY',
  'admin.transfers.column.fees-uzs': 'Fees',
  'admin.transfers.column.status': 'Status',
  'admin.transfers.column.failure': 'Failure',
  'admin.transfers.column.actions': 'Actions',

  // transfers — bulk + pagination
  'admin.transfers.bulk.selected': '{count} selected',
  'admin.transfers.bulk.export': 'Export selected',
  'admin.transfers.bulk.review': 'Mark for review',
  'admin.transfers.bulk.clear': 'Clear selection',
  'admin.transfers.pagination.per-page': 'Rows per page',
  'admin.transfers.pagination.page': 'Page {page} of {total}',
  'admin.transfers.pagination.prev': 'Previous',
  'admin.transfers.pagination.next': 'Next',
  'admin.transfers.pagination.showing': 'Showing {from}–{to} of {count}',

  // transfers — empty / error
  'admin.transfers.empty.no-results.title': 'No transfers match these filters',
  'admin.transfers.empty.no-results.body': 'Adjust the filters or clear them to see results.',
  'admin.transfers.empty.no-results.clear': 'Clear filters',
  'admin.transfers.empty.total.title': 'No transfers yet',
  'admin.transfers.empty.total.body':
    'Transfers will appear here as soon as they start flowing.',
  'admin.transfers.error.title': 'Couldn’t load transfers',
  'admin.transfers.error.body':
    'The realtime feed is unavailable. The filter bar still works on cached data.',
  'admin.transfers.error.retry': 'Retry',

  // transfers — detail page
  'admin.transfers.detail.back-to-list': 'Back to transfers',
  'admin.transfers.detail.breadcrumb': 'Transfers',
  'admin.transfers.detail.copy-id': 'Copy transfer ID',
  'admin.transfers.detail.id-copied': 'Transfer ID copied',
  'admin.transfers.detail.open-user': 'Open user',
  'admin.transfers.detail.not-found.title': 'Transfer not found',
  'admin.transfers.detail.not-found.body':
    'The transfer ID in the URL does not match any record.',
  'admin.transfers.detail.amount.title': 'Amount',
  'admin.transfers.detail.amount.locked-rate': 'Locked at 1 CNY = {rate} UZS',
  'admin.transfers.detail.amount.tooltip':
    'fx_rates.id={id} • valid_from={validFrom} • source={source}',

  'admin.transfers.detail.fx-breakdown': 'FX & fees breakdown',
  'admin.transfers.detail.fx.amount': 'Amount',
  'admin.transfers.detail.fx.fee': 'Service fee',
  'admin.transfers.detail.fx.spread': 'FX spread',
  'admin.transfers.detail.fx.total': 'Total charged',
  'admin.transfers.detail.fx.recipient-gets': 'Recipient receives',

  'admin.transfers.detail.card.title': 'Card',
  'admin.transfers.detail.card.bank': 'Bank',
  'admin.transfers.detail.card.holder': 'Holder',
  'admin.transfers.detail.card.country': 'Issuer country',
  'admin.transfers.detail.card.details': 'Card details',

  'admin.transfers.detail.recipient.title': 'Recipient',
  'admin.transfers.detail.recipient.handle': 'Handle',
  'admin.transfers.detail.recipient.display-name': 'Display name',
  'admin.transfers.detail.recipient.saved': 'Saved recipient',
  'admin.transfers.detail.recipient.unsaved': 'Not saved',

  'admin.transfers.detail.sender.title': 'Sender',
  'admin.transfers.detail.sender.tier': 'Tier',
  'admin.transfers.detail.sender.phone': 'Phone',
  'admin.transfers.detail.sender.pinfl': 'PINFL',
  'admin.transfers.detail.sender.open-profile': 'Open user profile',

  'admin.transfers.detail.timeline': 'Status timeline',
  'admin.transfers.detail.timeline.context': 'Context',
  'admin.transfers.detail.provider-response': 'Provider response',
  'admin.transfers.detail.provider-response.empty': 'No provider response yet',
  'admin.transfers.detail.aml-flags': 'AML flags',
  'admin.transfers.detail.aml.open-triage': 'Open in AML triage',

  // transfers — admin actions
  'admin.transfers.action.reverse': 'Reverse',
  'admin.transfers.action.force-fail': 'Force fail',
  'admin.transfers.action.resend-webhook': 'Resend webhook',
  'admin.transfers.action.copy-id': 'Copy transfer ID',
  'admin.transfers.action.open-audit': 'Open in audit log',
  'admin.transfers.action.cancel': 'Cancel',

  'admin.transfers.action.reverse.title': 'Reverse this transfer?',
  'admin.transfers.action.reverse.description':
    'The transfer will move to status reversed and a credit will be written to the sender ledger. This is logged to the audit trail and cannot be undone.',
  'admin.transfers.action.reverse.confirm': 'Reverse transfer',

  'admin.transfers.action.force-fail.title': 'Force-fail this transfer?',
  'admin.transfers.action.force-fail.description':
    'The transfer will move to status failed. Use this only when the provider confirms the transfer never landed and is stuck in processing > 10 minutes.',
  'admin.transfers.action.force-fail.confirm': 'Force fail',

  'admin.transfers.action.reason-label': 'Reason (required, min 10 characters)',
  'admin.transfers.action.reason-placeholder':
    'e.g. customer-confirmed wrong recipient handle…',
  'admin.transfers.action.reason-too-short': 'Reason must be at least 10 characters.',

  'admin.transfers.action.success.reversed': 'Transfer marked reversed',
  'admin.transfers.action.success.force-failed': 'Transfer marked failed',
  'admin.transfers.action.success.webhook-resent':
    'Webhook re-sent to {destination} provider',
  'admin.transfers.action.success.id-copied': 'Transfer ID copied to clipboard',

  // hint: bulk reversal not allowed
  'admin.transfers.bulk.no-state-change':
    'Bulk state changes are disabled — each reversal must be reviewed individually.',

  // tier badges
  'admin.tier.tier_0': 'Unverified',
  'admin.tier.tier_1': 'Phone verified',
  'admin.tier.tier_2': 'MyID verified',

  // severity
  'admin.severity.info': 'Info',
  'admin.severity.warning': 'Warning',
  'admin.severity.critical': 'Critical',

  // empty states
  'admin.empty.queue.title': 'Queue is clear',
  'admin.empty.queue.body': 'No items waiting for review.',

  // help overlay
  'admin.help.title': 'Keyboard shortcuts',
  'admin.help.subtitle': 'Move faster — every action has a key.',

  // placeholder
  'admin.placeholder.title': 'Coming in next phase',
  'admin.placeholder.body': 'This page will be designed in a future phase.',

  // theme
  'admin.theme.label': 'Theme',

  // error codes (sample subset; full set lives in error_codes table)
  'common.errors.LIMIT_DAILY_EXCEEDED.title': 'Daily limit reached',
  'common.errors.LIMIT_DAILY_EXCEEDED.body':
    'This transfer would exceed today\'s sending limit.',
  'common.errors.CARD_DECLINED.title': 'Card declined',
  'common.errors.CARD_DECLINED.body': 'Try a different card or contact your bank.',
  'common.errors.INSUFFICIENT_FUNDS.title': 'Insufficient funds',
  'common.errors.INSUFFICIENT_FUNDS.body': 'The card balance was below the total charge.',
  'common.errors.PROVIDER_UNAVAILABLE.title': 'Service unavailable',
  'common.errors.PROVIDER_UNAVAILABLE.body': 'The payment provider is temporarily unavailable.',
  'common.errors.RECIPIENT_INVALID.title': 'Invalid recipient',
  'common.errors.RECIPIENT_INVALID.body': 'Verify the Alipay or WeChat handle and try again.',
  'common.errors.SANCTIONS_HIT.title': 'Under review',
  'common.errors.SANCTIONS_HIT.body':
    'We are reviewing this transfer for compliance. We will notify you within 24 hours.',

  // ====================================================================
  // Transfer detail page
  // ====================================================================
  'admin.transfer-detail.back-link.list': 'Transfers',
  'admin.transfer-detail.back-link.user': "{name}'s transfers",
  'admin.transfer-detail.back-link.aml': 'AML flag',
  'admin.transfer-detail.pager.position': '{position} of {total}',
  'admin.transfer-detail.pager.prev': 'Previous transfer',
  'admin.transfer-detail.pager.next': 'Next transfer',
  'admin.transfer-detail.pager.disabled-tooltip':
    'Open from the transfers list to navigate between transfers',
  'admin.transfer-detail.header.transfer-id': 'Transfer ID',
  'admin.transfer-detail.header.created-at': 'Created {relative}',
  'admin.transfer-detail.header.locked-rate': 'Locked at 1 CNY = {rate} UZS',
  'admin.transfer-detail.header.total-fees': '+ {amount} fees',
  'admin.transfer-detail.header.open-user': 'Open user',
  'admin.transfer-detail.header.open-audit': 'Open in audit log',
  'admin.transfer-detail.header.copied': 'Copied',
  'admin.transfer-detail.header.copy': 'Copy',

  'admin.transfer-detail.fx-fees.title': 'FX & fees breakdown',
  'admin.transfer-detail.fx-fees.amount-sent': 'Amount sent',
  'admin.transfer-detail.fx-fees.service-fee': 'Service fee',
  'admin.transfer-detail.fx-fees.fx-spread': 'FX spread',
  'admin.transfer-detail.fx-fees.total-charged': 'Total charged',
  'admin.transfer-detail.fx-fees.recipient-receives': 'Recipient receives',
  'admin.transfer-detail.fx-fees.rate-source':
    '1 CNY = {rate} UZS · {source} · locked at {time}',
  'admin.transfer-detail.fx-fees.rate-popover-title': 'Locked FX rate',
  'admin.transfer-detail.fx-fees.rate-popover.id': 'Rate ID',
  'admin.transfer-detail.fx-fees.rate-popover.source': 'Source',
  'admin.transfer-detail.fx-fees.rate-popover.valid-from': 'Valid from',
  'admin.transfer-detail.fx-fees.rate-popover.valid-to': 'Valid to',
  'admin.transfer-detail.fx-fees.rate-popover.spread': 'Spread',
  'admin.transfer-detail.fx-fees.rate-popover.mid-rate': 'Mid rate',
  'admin.transfer-detail.fx-fees.chart.title': '24h rate trend',
  'admin.transfer-detail.fx-fees.chart.locked-marker': 'Lock time',

  'admin.transfer-detail.sender.title': 'Sender',
  'admin.transfer-detail.sender.lifetime-stats': '{count} transfers · {total} lifetime',
  'admin.transfer-detail.sender.deleted': 'Account deleted',
  'admin.transfer-detail.sender.open-profile': 'Open user profile',

  'admin.transfer-detail.recipient.title': 'Recipient',
  'admin.transfer-detail.recipient.transfer-count.first': 'First transfer to this recipient',
  'admin.transfer-detail.recipient.transfer-count.nth':
    '{count}th transfer to this recipient',
  'admin.transfer-detail.recipient.deleted': 'Recipient no longer saved',
  'admin.transfer-detail.recipient.saved-badge': 'Saved',
  'admin.transfer-detail.recipient.open': 'Open recipient',

  'admin.transfer-detail.card.title': 'Card used',
  'admin.transfer-detail.card.removed': 'Card removed',
  'admin.transfer-detail.card.open': 'Open card',

  'admin.transfer-detail.aml.title': 'AML flags',
  'admin.transfer-detail.aml.sanctions-banner':
    'Sanctions match — review compliance protocol before any action.',
  'admin.transfer-detail.aml.open': 'Open flag',

  'admin.transfer-detail.notes.title': 'Internal notes',
  'admin.transfer-detail.notes.empty':
    'No internal notes yet. Add one to share context with other ops.',
  'admin.transfer-detail.notes.add': 'Add note',
  'admin.transfer-detail.notes.tag.compliance': 'Compliance',
  'admin.transfer-detail.notes.tag.fraud': 'Fraud',
  'admin.transfer-detail.notes.tag.customer-support': 'Customer support',
  'admin.transfer-detail.notes.tag.general': 'General',

  'admin.transfer-detail.provider.title': 'Provider response',
  'admin.transfer-detail.provider.last-webhook': 'Last webhook {relative}',
  'admin.transfer-detail.provider.copy-json': 'Copy raw JSON',
  'admin.transfer-detail.provider.events': 'Webhook events',
  'admin.transfer-detail.provider.raw': 'Raw response',
  'admin.transfer-detail.provider.event-row':
    '{type} · HTTP {code} · retry {retry}',

  'admin.transfer-detail.audit.title': 'Admin action history',
  'admin.transfer-detail.audit.empty': 'No admin actions on this transfer.',
  'admin.transfer-detail.audit.view-full': 'View full audit trail',
  'admin.transfer-detail.audit.action.note_added': 'Added note',
  'admin.transfer-detail.audit.action.webhook_resent': 'Resent webhook',
  'admin.transfer-detail.audit.action.force_failed': 'Force-failed',
  'admin.transfer-detail.audit.action.marked_completed': 'Marked completed',
  'admin.transfer-detail.audit.action.reversed': 'Reversed',
  'admin.transfer-detail.audit.action.refunded': 'Refunded',

  'admin.transfer-detail.timeline.title': 'Status timeline',
  'admin.transfer-detail.timeline.actor.system': 'System',
  'admin.transfer-detail.timeline.actor.user': 'User',
  'admin.transfer-detail.timeline.actor.provider': 'Provider',
  'admin.transfer-detail.timeline.actor.admin': 'Admin',
  'admin.transfer-detail.timeline.live-update-toast':
    'Status updated: {from} → {to}',
  'admin.transfer-detail.timeline.realtime-lost-banner':
    'Realtime updates unavailable. Manual refresh required.',
  'admin.transfer-detail.timeline.realtime-retry': 'Retry',
  'admin.transfer-detail.timeline.context-toggle': 'Show context',

  // Actions — primary buttons + descriptions
  'admin.transfer-detail.action.add-note': 'Add note',
  'admin.transfer-detail.action.add-note.title': 'Add internal note',
  'admin.transfer-detail.action.add-note.description':
    'Notes are visible to other admins and append to the audit log.',
  'admin.transfer-detail.action.add-note.body': 'Note',
  'admin.transfer-detail.action.add-note.body-placeholder':
    'Share context — what you saw, what you did, what others should know.',
  'admin.transfer-detail.action.add-note.tag': 'Tag',
  'admin.transfer-detail.action.add-note.submit': 'Add note',

  'admin.transfer-detail.action.resend-webhook': 'Resend webhook',
  'admin.transfer-detail.action.resend-webhook.title': 'Resend webhook',
  'admin.transfer-detail.action.resend-webhook.body':
    'Re-attempt the webhook to {provider} for external_tx_id: {id}. The provider will respond fresh — current transfer state may change.',
  'admin.transfer-detail.action.resend-webhook.reason': 'Reason',
  'admin.transfer-detail.action.resend-webhook.notify-user': 'Notify user',
  'admin.transfer-detail.action.resend-webhook.submit': 'Resend webhook',

  'admin.transfer-detail.action.force-fail': 'Force fail',
  'admin.transfer-detail.action.force-fail.title': 'Force fail transfer',
  'admin.transfer-detail.action.force-fail.warning':
    'Force-failing skips provider confirmation. Use only when the provider has confirmed failure out-of-band or the transfer is stuck.',
  'admin.transfer-detail.action.force-fail.failure-code': 'Failure code',
  'admin.transfer-detail.action.force-fail.reason': 'Reason',
  'admin.transfer-detail.action.force-fail.reason-placeholder':
    'Explain why force-failing instead of waiting for provider response (≥30 chars).',
  'admin.transfer-detail.action.force-fail.notify-user': 'Notify user',
  'admin.transfer-detail.action.force-fail.submit': 'Force fail',
  'admin.transfer-detail.action.force-fail.confirm-title': 'Force fail this transfer?',
  'admin.transfer-detail.action.force-fail.confirm-body':
    'Status will move to failed and cannot be undone.',

  'admin.transfer-detail.action.mark-completed': 'Mark completed',
  'admin.transfer-detail.action.mark-completed.title': 'Mark as completed',
  'admin.transfer-detail.action.mark-completed.warning':
    'Manual completion bypasses provider confirmation. Use only when the provider has confirmed delivery out-of-band (e.g. via support ticket or phone).',
  'admin.transfer-detail.action.mark-completed.provider-tx-id':
    'Provider transaction ID',
  'admin.transfer-detail.action.mark-completed.provider-tx-id-placeholder':
    'Paste the actual ID from the provider portal',
  'admin.transfer-detail.action.mark-completed.reason': 'Reason',
  'admin.transfer-detail.action.mark-completed.reason-placeholder':
    'High-audit context — explain how the out-of-band confirmation was obtained (≥50 chars).',
  'admin.transfer-detail.action.mark-completed.acknowledge':
    'I confirm the recipient received {amount} CNY',
  'admin.transfer-detail.action.mark-completed.submit': 'Mark as completed',
  'admin.transfer-detail.action.mark-completed.confirm-title':
    'Manually complete this transfer?',
  'admin.transfer-detail.action.mark-completed.confirm-body':
    'Status will move to completed. Recipient will be notified.',

  'admin.transfer-detail.action.reverse': 'Reverse',
  'admin.transfer-detail.action.reverse.title': 'Reverse completed transfer',
  'admin.transfer-detail.action.reverse.warning':
    'Reversing returns funds to the source card via the acquirer. Original amount is credited; fees are not refunded.',
  'admin.transfer-detail.action.reverse.reason': 'Reason',
  'admin.transfer-detail.action.reverse.reason-placeholder':
    'High-audit context — explain why this reversal is being issued (≥50 chars).',
  'admin.transfer-detail.action.reverse.recipient.label': 'Refund recipient',
  'admin.transfer-detail.action.reverse.recipient.source-card':
    'Original source card',
  'admin.transfer-detail.action.reverse.recipient.alternate-card':
    'Alternate card',
  'admin.transfer-detail.action.reverse.recipient.external-bank':
    'External bank account',
  'admin.transfer-detail.action.reverse.bank.name': 'Bank name',
  'admin.transfer-detail.action.reverse.bank.holder': 'Account holder',
  'admin.transfer-detail.action.reverse.bank.number': 'Account number',
  'admin.transfer-detail.action.reverse.notify-user': 'Notify user',
  'admin.transfer-detail.action.reverse.notify-locked-tooltip':
    'Refunds and reversals always notify the user (compliance requirement).',
  'admin.transfer-detail.action.reverse.submit': 'Reverse transfer',
  'admin.transfer-detail.action.reverse.confirm-title': 'Reverse this transfer?',
  'admin.transfer-detail.action.reverse.confirm-body':
    'Source card will be credited {amount} UZS. This cannot be undone.',

  'admin.transfer-detail.action.refund': 'Refund partial',
  'admin.transfer-detail.action.refund.title': 'Refund partial amount',
  'admin.transfer-detail.action.refund.warning':
    'Partial refund credits a chosen amount back to the source. Original transfer status remains completed.',
  'admin.transfer-detail.action.refund.amount': 'Refund amount (UZS)',
  'admin.transfer-detail.action.refund.reason': 'Reason',
  'admin.transfer-detail.action.refund.reason-placeholder':
    'Explain why this partial refund is being issued (≥30 chars).',
  'admin.transfer-detail.action.refund.preview-line':
    'Refunding {refund} of {original}',
  'admin.transfer-detail.action.refund.preview-target': 'to {target}',
  'admin.transfer-detail.action.refund.preview-keeps':
    'Original transfer remains: Completed',
  'admin.transfer-detail.action.refund.submit': 'Issue refund',
  'admin.transfer-detail.action.refund.confirm-title':
    'Issue partial refund of {amount}?',
  'admin.transfer-detail.action.refund.confirm-body':
    'This cannot be reversed except by issuing another transfer.',

  'admin.transfer-detail.action.disabled.wrong-status':
    '{action} is only available for {status} transfers.',
  'admin.transfer-detail.action.more': 'More',
  'admin.transfer-detail.action.toast.success':
    '{action} recorded — see audit log for details.',
  'admin.transfer-detail.stuck.warning-chip': 'Stuck for {minutes}m',

  'admin.transfer-detail.error.not-found.title': 'Transfer not found',
  'admin.transfer-detail.error.not-found.body':
    'Maybe it was hard-deleted, or the ID is wrong.',
  'admin.transfer-detail.error.not-found.cta': 'Back to transfers',

  'admin.transfer-detail.mobile.timeline-button': 'Timeline',
  'admin.transfer-detail.mobile.more-button': 'More',

  'admin.transfer-detail.shortcuts.group': 'Transfer detail page',

  // ====================================================================
  // KYC Queue
  // ====================================================================
  'admin.kyc-queue.title': 'KYC Queue',
  'admin.kyc-queue.subtitle.counts':
    '{pending} pending · {reviewing} reviewing',
  'admin.kyc-queue.refresh': 'Refresh',

  // Filters
  'admin.kyc-queue.filter.status': 'Status',
  'admin.kyc-queue.filter.status.pending': 'Pending',
  'admin.kyc-queue.filter.status.passed': 'Passed',
  'admin.kyc-queue.filter.status.failed': 'Failed',
  'admin.kyc-queue.filter.status.expired': 'Expired',
  'admin.kyc-queue.filter.document-type': 'Document type',
  'admin.kyc-queue.filter.document-type.passport': 'Passport',
  'admin.kyc-queue.filter.document-type.id_card': 'ID card',
  'admin.kyc-queue.filter.tier': 'Resulting tier',
  'admin.kyc-queue.filter.age': 'Submitted',
  'admin.kyc-queue.filter.age.under-1h': '< 1h',
  'admin.kyc-queue.filter.age.under-24h': '< 24h',
  'admin.kyc-queue.filter.age.over-24h': '> 24h',
  'admin.kyc-queue.filter.age.over-7d': '> 7d',
  'admin.kyc-queue.filter.assigned': 'Assigned',
  'admin.kyc-queue.filter.assigned.anyone': 'Anyone',
  'admin.kyc-queue.filter.assigned.me': 'Me',
  'admin.kyc-queue.filter.assigned.unassigned': 'Unassigned',
  'admin.kyc-queue.filter.clear-all': 'Clear all',

  // Assignee header select
  'admin.kyc-queue.assignee.all': 'All',
  'admin.kyc-queue.assignee.me': 'Assigned to me',

  // Sort
  'admin.kyc-queue.sort.newest': 'Newest first',
  'admin.kyc-queue.sort.oldest': 'Oldest first',

  // Row
  'admin.kyc-queue.row.passport': 'Passport',
  'admin.kyc-queue.row.id-card': 'ID card',
  'admin.kyc-queue.row.submitted-ago': 'Submitted {relative}',
  'admin.kyc-queue.row.expiring-in': 'Expiring in {minutes}m',
  'admin.kyc-queue.row.assignee-prefix': 'Reviewing: {name}',
  'admin.kyc-queue.row.actions-label': 'Row actions',

  // Bulk
  'admin.kyc-queue.bulk.selected': '{count} selected',
  'admin.kyc-queue.bulk.approve': 'Approve',
  'admin.kyc-queue.bulk.reject': 'Reject',
  'admin.kyc-queue.bulk.assign-me': 'Assign to me',
  'admin.kyc-queue.bulk.clear': 'Clear selection',
  'admin.kyc-queue.bulk.approve.result':
    'Approved {approved} · skipped {skipped}',
  'admin.kyc-queue.bulk.approve.result-detail':
    '{underAge} under-18 · {sanctions} sanctions-hit (review individually)',

  // Empty / loading / error
  'admin.kyc-queue.empty.cleared': 'Queue is clear',
  'admin.kyc-queue.empty.cleared.body':
    'No verifications waiting for review. Auto-refreshing every 30s.',
  'admin.kyc-queue.empty.no-results.title': 'No verifications match',
  'admin.kyc-queue.empty.no-results.body': 'Try adjusting or clearing filters.',
  'admin.kyc-queue.empty.no-selection.title': 'Select a verification to review',
  'admin.kyc-queue.empty.no-selection.body':
    'Pick a row on the left, or press {key} on the focused row.',
  'admin.kyc-queue.error.list.title': "Couldn't load verifications",
  'admin.kyc-queue.error.list.body': 'The realtime feed is unavailable.',
  'admin.kyc-queue.error.list.retry': 'Retry',
  'admin.kyc-queue.error.action.title': "Couldn't apply action",
  'admin.kyc-queue.error.action.body': 'Please try again in a moment.',

  // Detail — top
  'admin.kyc-queue.detail.open-user': 'Open user profile',
  'admin.kyc-queue.detail.copy-session': 'Copy session ID',
  'admin.kyc-queue.detail.session-copied': 'Session ID copied',

  // Detail — Identity card
  'admin.kyc-queue.detail.identity': 'Identity',
  'admin.kyc-queue.detail.identity.full-name': 'Full name',
  'admin.kyc-queue.detail.identity.dob': 'Date of birth',
  'admin.kyc-queue.detail.identity.age': '{count} years old',
  'admin.kyc-queue.detail.identity.document-type': 'Document type',
  'admin.kyc-queue.detail.identity.document-number': 'Document number',
  'admin.kyc-queue.detail.identity.pinfl': 'PINFL',
  'admin.kyc-queue.detail.identity.session-id': 'MyID session',
  'admin.kyc-queue.detail.identity.submitted-at': 'Submitted',
  'admin.kyc-queue.detail.identity.verified-at': 'Verified',
  'admin.kyc-queue.detail.identity.expires-at': 'Verification expires',
  'admin.kyc-queue.detail.identity.resulting-tier': 'On approval, promotes to',
  'admin.kyc-queue.detail.identity.assignee': 'Assignee',
  'admin.kyc-queue.detail.identity.unassigned': 'Unassigned',

  // Detail — Document image
  'admin.kyc-queue.detail.document-image': 'Document scan',
  'admin.kyc-queue.detail.document-image.banner':
    'Sensitive — do not screenshot. Reveals are logged to the audit trail.',
  'admin.kyc-queue.detail.document-image.show-face': 'Show face',
  'admin.kyc-queue.detail.document-image.hide-face': 'Hide face',
  'admin.kyc-queue.detail.document-image.show-doc-number':
    'Show document number',
  'admin.kyc-queue.detail.document-image.hide-doc-number':
    'Hide document number',
  'admin.kyc-queue.detail.document-image.placeholder-label': 'Document scan',
  'admin.kyc-queue.detail.document-image.no-image':
    'No document scan attached to this verification.',

  // Detail — MyID response
  'admin.kyc-queue.detail.myid-response': 'MyID response',
  'admin.kyc-queue.detail.myid-response.copy': 'Copy JSON',
  'admin.kyc-queue.detail.myid-response.copied': 'JSON copied',
  'admin.kyc-queue.detail.myid-response.label': 'Raw payload',
  'admin.kyc-queue.detail.myid-response.note':
    'Sensitive fields (full PINFL, full document number) are redacted at the data layer.',

  // Detail — Edge-case banners
  'admin.kyc-queue.warning.under-18.title': 'Under 18 — auto-blocked',
  'admin.kyc-queue.warning.under-18.body':
    'DOB shows {age} years. tier_2 verification is unavailable for minors. Approve is disabled.',
  'admin.kyc-queue.warning.data-mismatch.title': 'Name mismatch with users table',
  'admin.kyc-queue.warning.data-mismatch.body':
    'MyID returned “{myid}”; sign-up name is “{user}”. Verify identity carefully — this is a soft warning, you can still approve.',
  'admin.kyc-queue.warning.sanctions-hit.title':
    'Sanctions match — escalate to compliance',
  'admin.kyc-queue.warning.sanctions-hit.body':
    'Cannot approve until compliance clears the AML flag. Use Escalate to route to senior review.',
  'admin.kyc-queue.warning.expiring-soon.title':
    'Auto-expires in {minutes}m without review',
  'admin.kyc-queue.warning.expiring-soon.body':
    'The user will be notified to re-submit. Approve or reject now to prevent silent expiry.',

  // Detail — info-requests counter
  'admin.kyc-queue.detail.info-requests': '{count} info requests sent',

  // Action bar — primary buttons
  'admin.kyc-queue.action.approve': 'Approve',
  'admin.kyc-queue.action.reject': 'Reject',
  'admin.kyc-queue.action.request-info': 'Request more info',
  'admin.kyc-queue.action.escalate': 'Escalate',

  // Approve modal
  'admin.kyc-queue.action.approve.confirm-title': 'Approve KYC for {phone}?',
  'admin.kyc-queue.action.approve.confirm-body':
    'User will be promoted to {tier}. Verification expires in 12 months.',
  'admin.kyc-queue.action.approve.confirm-submit': 'Approve verification',
  'admin.kyc-queue.action.approve.success': 'Verification approved',
  'admin.kyc-queue.action.approve.disabled.under-18':
    'Under-18 — approval is auto-blocked.',
  'admin.kyc-queue.action.approve.disabled.sanctions':
    'Sanctions match — clear the AML flag before approving.',
  'admin.kyc-queue.action.approve.disabled.terminal':
    'Verification already in a terminal state.',

  // Reject modal
  'admin.kyc-queue.action.reject.title': 'Reject verification',
  'admin.kyc-queue.action.reject.body':
    'User stays at the previous tier. They will be notified with the reason. This action is logged to the audit trail.',
  'admin.kyc-queue.action.reject.failure-reason': 'Failure reason',
  'admin.kyc-queue.action.reject.failure-reason.document_unreadable':
    'Document unreadable',
  'admin.kyc-queue.action.reject.failure-reason.data_mismatch': 'Data mismatch',
  'admin.kyc-queue.action.reject.failure-reason.under_18': 'Under 18',
  'admin.kyc-queue.action.reject.failure-reason.sanctions_hit': 'Sanctions hit',
  'admin.kyc-queue.action.reject.failure-reason.other': 'Other',
  'admin.kyc-queue.action.reject.reason-label': 'Reason (visible to user)',
  'admin.kyc-queue.action.reject.reason-placeholder':
    'Be specific — the user sees this text. Min 10 characters.',
  'admin.kyc-queue.action.reject.submit': 'Reject verification',
  'admin.kyc-queue.action.reject.success': 'Verification rejected',

  // Request more info
  'admin.kyc-queue.action.request-info.title': 'Request more information',
  'admin.kyc-queue.action.request-info.body':
    'A notification is sent to the user. The verification stays in pending state.',
  'admin.kyc-queue.action.request-info.message': 'Message to user',
  'admin.kyc-queue.action.request-info.message-placeholder':
    'e.g. Please re-take the passport photo with the full MRZ visible. Min 10 characters.',
  'admin.kyc-queue.action.request-info.submit': 'Send request',
  'admin.kyc-queue.action.request-info.success': 'Information request sent',

  // Escalate
  'admin.kyc-queue.action.escalate.title': 'Escalate to senior review',
  'admin.kyc-queue.action.escalate.body':
    'Marks for senior compliance review. The action is logged for audit; senior role wiring is planned for a future release.',
  'admin.kyc-queue.action.escalate.reason-label': 'Reason for escalation',
  'admin.kyc-queue.action.escalate.reason-placeholder':
    'Explain why this verification needs senior review. Min 10 characters.',
  'admin.kyc-queue.action.escalate.submit': 'Escalate',
  'admin.kyc-queue.action.escalate.success': 'Escalated for senior review',

  // Common
  'admin.kyc-queue.action.reason-too-short': 'Min {min} characters.',
  'admin.kyc-queue.action.toast.audit-logged':
    '{action} — logged to audit trail',
  'admin.kyc-queue.tier-promotion.tier_2': 'tier_2 (MyID verified)',

  // Mobile detail page
  'admin.kyc-queue.mobile.back': 'Back to queue',
  'admin.kyc-queue.mobile.more': 'More',

  // Help overlay group
  'admin.kyc-queue.shortcuts.group': 'KYC Queue',
};

/**
 * Translate a key. For now, English only.
 * Returns the key itself if missing, so missing keys are obvious during dev.
 */
export function t(key: string, params?: Record<string, string | number>): string {
  let str = EN[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}
