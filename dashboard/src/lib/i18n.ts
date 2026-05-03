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

  // shared datetime picker (Popover-anchored Calendar + time selects)
  'common.datetime.placeholder': 'Pick a date and time',
  'common.datetime.time': 'Time',
  'common.datetime.hour': 'Hour',
  'common.datetime.minute': 'Minute',
  'common.datetime.clear': 'Clear',
  'common.datetime.no-selection': 'No date selected',
  'common.datetime.prev-month': 'Previous month',
  'common.datetime.next-month': 'Next month',

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
  'admin.transfers.column.destination': 'Destination',
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
  'admin.transfer-detail.back-link.list': 'Back to transfers',
  'admin.transfer-detail.back-link.user': "Back to {name}'s transfers",
  'admin.transfer-detail.back-link.aml': 'Back to AML flag',
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
  'admin.kyc-queue.detail.identity.doc-passport': 'Passport',
  'admin.kyc-queue.detail.identity.doc-id-card': 'ID card',
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

  // ====================================================================
  // AML Triage
  // ====================================================================
  'admin.aml-triage.title': 'AML Triage',
  'admin.aml-triage.subtitle.counts':
    '{critical} critical · {warning} warning · {info} info open · {reviewing} reviewing',
  'admin.aml-triage.refresh': 'Refresh',
  'admin.aml-triage.new-manual-flag': 'New manual flag',

  // page-top critical banner
  'admin.aml-triage.banner.critical-unassigned':
    '{count} critical flags open and unassigned',
  'admin.aml-triage.banner.assign-first-to-me': 'Assign first to me',

  // assignee quick-toggle
  'admin.aml-triage.assignee.all': 'All',
  'admin.aml-triage.assignee.me': 'Assigned to me',

  // filters
  'admin.aml-triage.filter.severity': 'Severity',
  'admin.aml-triage.filter.severity.info': 'Info',
  'admin.aml-triage.filter.severity.warning': 'Warning',
  'admin.aml-triage.filter.severity.critical': 'Critical',
  'admin.aml-triage.filter.type': 'Type',
  'admin.aml-triage.filter.type.velocity': 'Velocity',
  'admin.aml-triage.filter.type.amount': 'Amount',
  'admin.aml-triage.filter.type.pattern': 'Pattern',
  'admin.aml-triage.filter.type.sanctions': 'Sanctions',
  'admin.aml-triage.filter.type.manual': 'Manual',
  'admin.aml-triage.filter.status': 'Status',
  'admin.aml-triage.filter.status.open': 'Open',
  'admin.aml-triage.filter.status.reviewing': 'Reviewing',
  'admin.aml-triage.filter.status.cleared': 'Cleared',
  'admin.aml-triage.filter.status.escalated': 'Escalated',
  'admin.aml-triage.filter.assigned': 'Assigned',
  'admin.aml-triage.filter.assigned.anyone': 'Anyone',
  'admin.aml-triage.filter.assigned.me': 'Me',
  'admin.aml-triage.filter.assigned.unassigned': 'Unassigned',
  'admin.aml-triage.filter.has-transfer': 'Has linked transfer',
  'admin.aml-triage.filter.clear-all': 'Clear all',

  'admin.aml-triage.sort.severity-age': 'Most urgent first',
  'admin.aml-triage.sort.newest': 'Newest first',
  'admin.aml-triage.sort.oldest': 'Oldest first',
  'admin.aml-triage.sort.label': 'Sort',

  // row
  'admin.aml-triage.row.linked-transfer': 'Tx {prefix}',
  'admin.aml-triage.row.assigned-prefix': 'Reviewing: {name}',
  'admin.aml-triage.row.reviewing-by': 'Reviewing by {name}',
  'admin.aml-triage.row.unassigned': 'Unassigned',

  // bulk
  'admin.aml-triage.bulk.selected': '{count} selected',
  'admin.aml-triage.bulk.assign-me': 'Assign to me',
  'admin.aml-triage.bulk.clear': 'Clear selection',

  // empty / error / loading
  'admin.aml-triage.empty.cleared': 'No open flags right now',
  'admin.aml-triage.empty.cleared.body':
    'New flags appear here as soon as the engine raises them.',
  'admin.aml-triage.empty.no-results.title': 'No flags match',
  'admin.aml-triage.empty.no-results.body': 'Try adjusting or clearing filters.',
  'admin.aml-triage.empty.no-selection.title': 'Select a flag to triage',
  'admin.aml-triage.empty.no-selection.body':
    'Pick a row on the left, or press {key} on the focused row.',
  'admin.aml-triage.error.list.title': "Couldn't load flags",
  'admin.aml-triage.error.list.body': 'The realtime feed is unavailable.',
  'admin.aml-triage.error.list.retry': 'Retry',

  // detail — top bar
  'admin.aml-triage.detail.flag-id': 'Flag ID',
  'admin.aml-triage.detail.copy-id': 'Copy flag ID',
  'admin.aml-triage.detail.id-copied': 'Flag ID copied',

  // detail — sanctions banner
  'admin.aml-triage.detail.sanctions-banner.title':
    'Sanctions match — escalate only',
  'admin.aml-triage.detail.sanctions-banner.body':
    'Clearing is disabled. Do not communicate match details to the user. Document source-of-funds before any further action.',

  // detail — user card
  'admin.aml-triage.detail.user-card': 'User',
  'admin.aml-triage.detail.user-card.phone': 'Phone',
  'admin.aml-triage.detail.user-card.pinfl': 'PINFL',
  'admin.aml-triage.detail.user-card.tier': 'Tier',
  'admin.aml-triage.detail.user-card.account-status': 'Account status',
  'admin.aml-triage.detail.user-card.lifetime': 'Lifetime',
  'admin.aml-triage.detail.user-card.lifetime-value':
    '{count} transfers · {volume}',
  'admin.aml-triage.detail.user-card.joined': 'Joined',
  'admin.aml-triage.detail.user-card.open-profile': 'Open user profile',
  'admin.aml-triage.detail.user-card.account-blocked': 'BLOCKED',

  // detail — linked transfer card
  'admin.aml-triage.detail.linked-transfer': 'Linked transfer',
  'admin.aml-triage.detail.linked-transfer.amount': 'Amount',
  'admin.aml-triage.detail.linked-transfer.recipient': 'Recipient',
  'admin.aml-triage.detail.linked-transfer.scheme': 'Card',
  'admin.aml-triage.detail.linked-transfer.open': 'Open transfer',
  'admin.aml-triage.detail.linked-transfer.none': 'No linked transfer (user-level flag).',

  // detail — flag context (typed)
  'admin.aml-triage.detail.context': 'Flag context',
  'admin.aml-triage.detail.context.velocity':
    '{count} transfers in last {minutes} minutes',
  'admin.aml-triage.detail.context.velocity.threshold': 'Threshold: {threshold}',
  'admin.aml-triage.detail.context.amount':
    '{amount} — {sigma}σ above this user’s average',
  'admin.aml-triage.detail.context.amount.user-avg': "User’s avg: {amount}",
  'admin.aml-triage.detail.context.amount.multiplier': '{multiplier}× user avg',
  'admin.aml-triage.detail.context.pattern': 'Pattern: {rule}',
  'admin.aml-triage.detail.context.pattern.signal': 'Matched signal',
  'admin.aml-triage.detail.context.pattern.description': 'Why this matters',
  'admin.aml-triage.detail.context.sanctions': 'Sanctions hit',
  'admin.aml-triage.detail.context.sanctions.list': 'Watchlist',
  'admin.aml-triage.detail.context.sanctions.matched-name': 'Matched name',
  'admin.aml-triage.detail.context.sanctions.match-score': 'Match score',
  'admin.aml-triage.detail.context.sanctions.recipient-handle': 'Recipient handle',
  'admin.aml-triage.detail.context.manual': 'Manually filed',
  'admin.aml-triage.detail.context.manual.filer': 'Filed by',
  'admin.aml-triage.detail.context.manual.note': 'Filer note',
  'admin.aml-triage.detail.context.json-toggle': 'Show raw context',
  'admin.aml-triage.detail.context.json-copy': 'Copy JSON',
  'admin.aml-triage.detail.context.json-copied': 'JSON copied',
  'admin.aml-triage.detail.context.recent-transfers': 'Recent transfers',

  // detail — resolution notes
  'admin.aml-triage.detail.resolution-notes': 'Resolution notes',
  'admin.aml-triage.detail.resolution-notes.placeholder':
    'Optional context — captured at clear / escalate. Visible to the audit log.',
  'admin.aml-triage.detail.resolution-notes.history-prefix':
    '{actor} · {date}',

  // action bar — labels
  'admin.aml-triage.action.clear': 'Clear',
  'admin.aml-triage.action.escalate': 'Escalate',
  'admin.aml-triage.action.assign-me': 'Assign to me',
  'admin.aml-triage.action.reassign': 'Reassign',

  // disabled tooltips
  'admin.aml-triage.action.clear.disabled.sanctions':
    'Sanctions hits cannot be cleared from this view — escalate only.',
  'admin.aml-triage.action.clear.disabled.terminal':
    'Flag is already in a terminal state.',
  'admin.aml-triage.action.escalate.disabled.terminal':
    'Flag is already in a terminal state.',

  // Clear modal
  'admin.aml-triage.action.clear.title': 'Clear flag',
  'admin.aml-triage.action.clear.body':
    'Marks this flag as resolved with no action. The reviewer’s reason and notes are written to the audit trail.',
  'admin.aml-triage.action.clear.reason-code': 'Reason',
  'admin.aml-triage.action.clear.reason-code.false_positive': 'False positive',
  'admin.aml-triage.action.clear.reason-code.verified_legitimate':
    'Verified legitimate',
  'admin.aml-triage.action.clear.reason-code.low_risk': 'Low risk',
  'admin.aml-triage.action.clear.reason-code.other': 'Other',
  'admin.aml-triage.action.clear.notes-label': 'Notes (visible to audit log)',
  'admin.aml-triage.action.clear.notes-placeholder':
    'Be specific. Min 20 characters.',
  'admin.aml-triage.action.clear.submit': 'Clear flag',
  'admin.aml-triage.action.clear.success': 'Flag cleared',
  'admin.aml-triage.action.clear.confirm-title':
    'Clear this flag?',
  'admin.aml-triage.action.clear.confirm-body':
    'Status moves to cleared. This is logged to audit and cannot be undone.',

  // Escalate modal
  'admin.aml-triage.action.escalate.title': 'Escalate flag',
  'admin.aml-triage.action.escalate.body':
    'Routes to senior compliance review. The reviewer’s reason is written to the audit trail.',
  'admin.aml-triage.action.escalate.body.critical-block-warning':
    'Critical-severity escalation also auto-blocks the user account ({phone}). The user will be unable to send or sign in until manually unblocked.',
  'admin.aml-triage.action.escalate.body.sanctions-warning':
    'Sanctions match — the auto-filled template below MUST be reviewed and edited before submitting. Do not include match details in any user-visible message.',
  'admin.aml-triage.action.escalate.notes-label': 'Reason for escalation',
  'admin.aml-triage.action.escalate.notes-placeholder':
    'Explain why this needs senior review. Min 20 characters.',
  'admin.aml-triage.action.escalate.submit': 'Escalate',
  'admin.aml-triage.action.escalate.success': 'Flag escalated',
  'admin.aml-triage.action.escalate.success-blocked':
    'Flag escalated · user blocked',
  'admin.aml-triage.action.escalate.confirm-title':
    'Escalate this flag?',
  'admin.aml-triage.action.escalate.confirm-body':
    'Status moves to escalated. {extra}',
  'admin.aml-triage.action.escalate.confirm-body.block-user':
    'User account ({phone}) will be blocked.',
  'admin.aml-triage.action.escalate.notes-too-similar':
    'Edit the auto-filled template — add at least 30 characters of reviewer context.',

  // Reassign modal
  'admin.aml-triage.action.reassign.title': 'Reassign flag',
  'admin.aml-triage.action.reassign.body':
    'Pick the reviewer to take over. Choosing "Unassigned" returns the flag to the open queue.',
  'admin.aml-triage.action.reassign.assignee': 'Assignee',
  'admin.aml-triage.action.reassign.unassigned': 'Unassigned',
  'admin.aml-triage.action.reassign.submit': 'Reassign',
  'admin.aml-triage.action.reassign.success': 'Flag reassigned',

  // assign-to-me toast
  'admin.aml-triage.action.assign-me.success': 'Flag claimed',

  // sanctions warning chip + global
  'admin.aml-triage.warning.sanctions-no-clear':
    'Clearing disabled — sanctions hits must be escalated.',

  // mobile detail
  'admin.aml-triage.mobile.back': 'Back to triage',
  'admin.aml-triage.mobile.more': 'More',

  // Manual flag form
  'admin.aml-triage.new.title': 'New manual flag',
  'admin.aml-triage.new.subtitle':
    'Manually file an AML flag against a user (and optionally a specific transfer).',
  'admin.aml-triage.new.user': 'User',
  'admin.aml-triage.new.user.placeholder': 'Search by phone…',
  'admin.aml-triage.new.transfer': 'Linked transfer (optional)',
  'admin.aml-triage.new.transfer.placeholder':
    'Search by transfer id prefix…',
  'admin.aml-triage.new.transfer.none': 'No linked transfer',
  'admin.aml-triage.new.severity': 'Severity',
  'admin.aml-triage.new.type': 'Flag type',
  'admin.aml-triage.new.context': 'Context (JSON)',
  'admin.aml-triage.new.context.placeholder':
    '{"description": "What you observed"}',
  'admin.aml-triage.new.context.invalid-json': 'Context must be valid JSON.',
  'admin.aml-triage.new.note': 'Filer note',
  'admin.aml-triage.new.note.placeholder':
    'Why are you filing this manually? Visible to the next reviewer. Min 20 chars.',
  'admin.aml-triage.new.submit': 'File flag',
  'admin.aml-triage.new.cancel': 'Cancel',
  'admin.aml-triage.new.success': 'Manual flag filed',

  // help overlay group
  'admin.aml-triage.shortcuts.group': 'AML Triage',

  // =====================================================================
  // Users (/customers/users)
  // =====================================================================
  'admin.users.title': 'Users',
  'admin.users.subtitle': '{count} total users',
  'admin.users.search-placeholder': 'Search by phone, PINFL, name, or email',
  'admin.users.never': 'Never',
  'admin.users.pinfl-label': 'PINFL',
  'admin.users.pinfl-not-verified': 'PINFL not yet verified',
  'admin.users.aml-indicator': 'Has open AML flag',
  'admin.users.result-count': '{shown} of {total} shown',

  // filters
  'admin.users.filter.tier': 'Tier',
  'admin.users.filter.status': 'Status',
  'admin.users.filter.kyc': 'KYC',
  'admin.users.filter.language': 'Language',
  'admin.users.filter.created': 'Created',
  'admin.users.filter.has-aml': 'Has open AML flag',
  'admin.users.filter.clear-all': 'Clear all',
  'admin.users.filter.tier.tier_0': 'Tier 0 · Just signed up',
  'admin.users.filter.tier.tier_1': 'Tier 1 · Phone OTP only',
  'admin.users.filter.tier.tier_2': 'Tier 2 · MyID verified',
  'admin.users.filter.status.active': 'Active',
  'admin.users.filter.status.blocked': 'Blocked',
  'admin.users.filter.status.pending': 'Pending',
  'admin.users.filter.status.deleted': 'Deleted',
  'admin.users.filter.kyc.pending': 'KYC pending',
  'admin.users.filter.kyc.passed': 'KYC passed',
  'admin.users.filter.kyc.failed': 'KYC failed',
  'admin.users.filter.kyc.expired': 'KYC expired',
  'admin.users.filter.kyc.never': 'No KYC',
  'admin.users.filter.language.uz': 'Uzbek',
  'admin.users.filter.language.ru': 'Russian',
  'admin.users.filter.language.en': 'English',
  'admin.users.filter.created.all': 'All time',
  'admin.users.filter.created.today': 'Today',
  'admin.users.filter.created.7d': 'Last 7 days',
  'admin.users.filter.created.30d': 'Last 30 days',
  'admin.users.filter.created.custom': 'Custom range',

  // columns
  'admin.users.column.name': 'User',
  'admin.users.column.phone': 'Phone',
  'admin.users.column.tier': 'Tier',
  'admin.users.column.status': 'Status',
  'admin.users.column.kyc': 'KYC',
  'admin.users.column.cards': 'Cards',
  'admin.users.column.lifetime-volume': 'Lifetime volume',
  'admin.users.column.last-login': 'Last login',
  'admin.users.column.created': 'Joined',

  // empty
  'admin.users.empty.title': 'No users yet',
  'admin.users.empty.body-no-data': 'No users have been created in this environment.',
  'admin.users.empty.body-filtered': 'No users match the current filters.',

  // pagination
  'admin.users.pagination.page': 'Page {page} of {total}',
  'admin.users.pagination.prev': 'Previous',
  'admin.users.pagination.next': 'Next',

  // row kebab + page actions
  'admin.users.row.actions': 'Row actions',
  'admin.users.action.add-blacklist': 'Add to blacklist',
  'admin.users.action.export-csv': 'Export CSV',
  'admin.users.action.open-aml': 'Open AML flags',
  'admin.users.action.open-audit': 'Open audit log',

  // toast
  'admin.users.toast.exported': 'CSV exported',
  'admin.users.toast.exported-body': '{count} rows downloaded.',

  // detail header / nav
  'admin.users.detail.back': 'Back',
  'admin.users.detail.back-to-list': 'Back to users',
  'admin.users.detail.contact.telegram': 'Open in Telegram',
  'admin.users.detail.contact.whatsapp': 'Open in WhatsApp',
  'admin.users.detail.contact.telegram-label': 'Telegram',
  'admin.users.detail.contact.whatsapp-label': 'WhatsApp',
  'admin.users.detail.menu.aria': 'Admin actions',
  'admin.users.detail.tabs.aria': 'User detail tabs',
  'admin.users.detail.not-found.title': 'User not found',
  'admin.users.detail.not-found.body': "We couldn't find a user with that ID.",

  // chips
  'admin.users.detail.chip.created': 'Joined {date}',
  'admin.users.detail.chip.last-login': 'Last login {value}',
  'admin.users.detail.chip.never-logged-in': 'Never logged in',
  'admin.users.detail.chip.kyc-expired': 'KYC expired',
  'admin.users.detail.chip.kyc-expires-in': 'KYC expires in {days} days',
  'admin.users.detail.chip.kyc-expires-on': 'KYC expires {date}',

  // tabs
  'admin.users.detail.tab.overview': 'Overview',
  'admin.users.detail.tab.kyc': 'KYC',
  'admin.users.detail.tab.cards': 'Cards',
  'admin.users.detail.tab.transfers': 'Transfers',
  'admin.users.detail.tab.recipients': 'Recipients',
  'admin.users.detail.tab.aml': 'AML Flags',
  'admin.users.detail.tab.devices': 'Devices',
  'admin.users.detail.tab.audit': 'Audit',

  // KPI
  'admin.users.detail.kpi.volume': 'Lifetime volume',
  'admin.users.detail.kpi.count': 'Lifetime transfers',
  'admin.users.detail.kpi.success-rate': 'Success rate',

  // limits
  'admin.users.detail.limits.title': 'Limits & headroom',
  'admin.users.detail.limits.daily': 'Daily',
  'admin.users.detail.limits.monthly': 'Monthly',
  'admin.users.detail.limits.tier-zero-body': "User has just signed up — phone OTP and MyID verification both pending. Transfers cannot be initiated until MyID is complete.",
  'admin.users.detail.limits.tier-one-body': "Phone verified but MyID not yet completed — partial registration. The user cannot send transfers until MyID identity verification passes.",

  // charts
  'admin.users.detail.chart.monthly-volume': 'Volume by month',
  'admin.users.detail.chart.status-breakdown': 'Transfers by status',
  'admin.users.detail.chart.volume-tooltip': 'Volume',
  'admin.users.detail.chart.empty': 'No transfer history yet.',

  // recent activity
  'admin.users.detail.recent-activity.title': 'Recent activity',
  'admin.users.detail.recent-activity.empty': 'No transfers yet for this user.',
  'admin.users.detail.recent-activity.view-all': 'View all transfers',

  // KYC tab
  'admin.users.detail.kyc.current-tier': 'Current tier',
  'admin.users.detail.kyc.attained-via': 'Attained via {method}',
  'admin.users.detail.kyc.verified-at': 'Verified at',
  'admin.users.detail.kyc.expires-at': 'Expires at',
  'admin.users.detail.kyc.doc-number': 'Document',
  'admin.users.detail.kyc.no-current-tier': 'No active KYC verification.',
  'admin.users.detail.kyc.history-title': 'Verification history',
  'admin.users.detail.kyc.history-empty': 'No verifications yet.',
  'admin.users.detail.kyc.col.status': 'Status',
  'admin.users.detail.kyc.col.doc-type': 'Document type',
  'admin.users.detail.kyc.col.submitted': 'Submitted',
  'admin.users.detail.kyc.col.verified': 'Verified',
  'admin.users.detail.kyc.col.expires': 'Expires',
  'admin.users.detail.kyc.col.failure': 'Failure reason',

  // MyID profile card (renders for users who've passed MyID at least once)
  'admin.users.detail.myid.title': 'MyID profile',
  'admin.users.detail.myid.subtitle': 'Identity payload returned by MyID at the time of verification.',
  'admin.users.detail.myid.match-score': 'Match',
  'admin.users.detail.myid.section.identity': 'Identity',
  'admin.users.detail.myid.section.document': 'Document',
  'admin.users.detail.myid.section.contacts': 'Contacts',
  'admin.users.detail.myid.section.address': 'Address & registration',
  'admin.users.detail.myid.section.metadata': 'Verification metadata',
  'admin.users.detail.myid.field.full-name-uz': 'Full name (UZ)',
  'admin.users.detail.myid.field.full-name-en': 'Full name (EN)',
  'admin.users.detail.myid.field.gender': 'Gender',
  'admin.users.detail.myid.field.birth-date': 'Date of birth',
  'admin.users.detail.myid.field.birth-place': 'Place of birth',
  'admin.users.detail.myid.field.nationality': 'Nationality',
  'admin.users.detail.myid.field.citizenship': 'Citizenship',
  'admin.users.detail.myid.field.pinfl': 'PINFL',
  'admin.users.detail.myid.field.doc-type': 'Document type',
  'admin.users.detail.myid.field.doc-number': 'Document number',
  'admin.users.detail.myid.field.issued-by': 'Issued by',
  'admin.users.detail.myid.field.issued-date': 'Issued',
  'admin.users.detail.myid.field.expiry-date': 'Expires',
  'admin.users.detail.myid.field.phone': 'Phone',
  'admin.users.detail.myid.field.email': 'Email',
  'admin.users.detail.myid.field.permanent-address': 'Permanent address',
  'admin.users.detail.myid.field.temporary-address': 'Temporary address',
  'admin.users.detail.myid.field.region': 'Region',
  'admin.users.detail.myid.field.district': 'District',
  'admin.users.detail.myid.field.mfy': 'Mahalla (MFY)',
  'admin.users.detail.myid.field.cadastre': 'Cadastre',
  'admin.users.detail.myid.field.registration-date': 'Registered',
  'admin.users.detail.myid.field.job-id': 'Job ID',
  'admin.users.detail.myid.field.reuid': 'REUID',
  'admin.users.detail.myid.field.reuid-expires': 'REUID expires',
  'admin.users.detail.myid.field.sdk-hash': 'SDK hash',
  'admin.users.detail.myid.field.last-update-pass': 'Doc data updated',
  'admin.users.detail.myid.field.last-update-address': 'Address updated',
  'admin.users.detail.myid.no-temporary': 'No temporary registration',
  'admin.users.detail.myid.raw-title': 'Raw MyID response',
  'admin.users.detail.myid.raw-note': 'Sensitive fields (PINFL, document number) are redacted at the data layer.',
  'admin.users.detail.myid.raw-label': 'JSON payload',
  'admin.users.detail.myid.copy': 'Copy',
  'admin.users.detail.myid.copied': 'Copied',

  // Cards tab
  'admin.users.detail.cards.empty-title': 'No linked cards',
  'admin.users.detail.cards.empty-body': "User hasn't linked any cards yet.",
  'admin.users.detail.cards.usage': '{used} of {max} cards linked',
  'admin.users.detail.cards.default': 'Default',
  'admin.users.detail.cards.frozen': 'Frozen',
  'admin.users.detail.cards.expires': 'Expires {month}/{year}',
  'admin.users.detail.cards.added-on': 'Added {date}',

  // Transfers tab
  'admin.users.detail.transfers.empty-title': 'No transfers',
  'admin.users.detail.transfers.empty-body': "User hasn't sent any transfers yet.",
  'admin.users.detail.transfers.col.created': 'Created',
  'admin.users.detail.transfers.col.recipient': 'Recipient',
  'admin.users.detail.transfers.col.card': 'Card',
  'admin.users.detail.transfers.col.uzs': 'UZS',
  'admin.users.detail.transfers.col.cny': 'CNY',
  'admin.users.detail.transfers.col.status': 'Status',

  // Recipients tab
  'admin.users.detail.recipients.empty-title': 'No saved recipients',
  'admin.users.detail.recipients.empty-body': "User hasn't saved any Alipay or WeChat recipients yet.",
  'admin.users.detail.recipients.favorite': 'Favorite',
  'admin.users.detail.recipients.nickname': 'Nickname: {value}',
  'admin.users.detail.recipients.transfer-count': '{count} transfers',
  'admin.users.detail.recipients.last-used': 'Last used {value}',
  'admin.users.detail.recipients.added': 'Added {value}',

  // AML tab
  'admin.users.detail.aml.empty-title': 'No AML flags',
  'admin.users.detail.aml.empty-body': 'No flags raised against this user.',

  // Devices tab
  'admin.users.detail.devices.empty-title': 'No devices',
  'admin.users.detail.devices.empty-body': 'User has no recorded devices yet.',
  'admin.users.detail.devices.trusted': 'Trusted',
  'admin.users.detail.devices.untrusted': 'Step-up required',
  'admin.users.detail.devices.device-id': 'Device …{id}',
  'admin.users.detail.devices.last-seen': 'Last seen {value}',
  'admin.users.detail.devices.added': 'Added {value}',

  // Audit tab
  'admin.users.detail.audit.empty-title': 'No admin actions yet',
  'admin.users.detail.audit.empty-body': 'No admin actions have been recorded for this user.',
  'admin.users.detail.audit.by': 'by {actor}',
  'admin.users.audit.action.block': 'Blocked user',
  'admin.users.audit.action.unblock': 'Unblocked user',
  'admin.users.audit.action.soft_delete': 'Soft-deleted user',
  'admin.users.audit.action.reverify_kyc': 'Re-verify KYC requested',
  'admin.users.audit.action.blacklist_phone': 'Phone added to blacklist',
  'admin.users.audit.action.reset_devices': 'Device trust reset',
  'admin.users.audit.action.untrust_device': 'Device untrusted',
  'admin.users.audit.action.generate_audit_report': 'Audit report generated',
  'admin.users.audit.action.freeze_card': 'Card frozen',
  'admin.users.audit.action.unfreeze_card': 'Card unfrozen',
  'admin.users.audit.action.hard_delete_recipient': 'Recipient hard-deleted',

  // Common modal copy
  'admin.users.action.reason-label': 'Reason note',
  'admin.users.action.reason-placeholder': 'Why is this action being taken? Be specific — this is auditable.',
  'admin.users.action.confirm-reason-required': 'min 20 chars',

  // Admin menu items
  'admin.users.action.block': 'Block',
  'admin.users.action.unblock': 'Unblock',
  'admin.users.action.soft-delete': 'Soft-delete',
  'admin.users.action.reverify-kyc': 'Re-verify KYC',
  'admin.users.action.blacklist-phone': 'Add phone to blacklist',
  'admin.users.action.reset-devices': 'Reset device trust',
  'admin.users.action.generate-report': 'Generate audit report',

  // Block dialog
  'admin.users.action.block.title': 'Block {name}',
  'admin.users.action.block.body': 'Blocking will prevent the user from logging in. Active transfers continue but no new ones can be initiated.',
  'admin.users.action.block.cta': 'Block user',
  'admin.users.action.block.warning': 'All linked active cards will be auto-frozen. Cards stay frozen on unblock — you must unfreeze each individually.',
  'admin.users.action.block.success': '{name} blocked',
  'admin.users.action.block.success-cards': '{count} card(s) auto-frozen.',

  // Unblock dialog
  'admin.users.action.unblock.title': 'Unblock {name}',
  'admin.users.action.unblock.body': 'Restores user status to active. Note: linked cards stay frozen — you must unfreeze each one in the Cards tab.',
  'admin.users.action.unblock.cta': 'Unblock user',
  'admin.users.action.unblock.warning': '',
  'admin.users.action.unblock.success': '{name} unblocked',

  // Soft-delete dialog
  'admin.users.action.soft-delete.title': 'Soft-delete {name}',
  'admin.users.action.soft-delete.body': 'Marks the user as deleted, redacts PII display fields, and prevents login. Data is retained for compliance.',
  'admin.users.action.soft-delete.cta': 'Soft-delete user',
  'admin.users.action.soft-delete.warning': "This cannot be undone via the dashboard. Reversal requires a DBA escalation. Confirm you've reviewed the audit trail and any pending transfers.",
  'admin.users.action.soft-delete.confirm-title': 'Confirm soft-delete',
  'admin.users.action.soft-delete.confirm-body': "{name}'s profile will be redacted and they will no longer be able to log in. This cannot be undone via the dashboard.",
  'admin.users.action.soft-delete.confirm-cta': 'Yes, soft-delete',
  'admin.users.action.soft-delete.success': '{name} soft-deleted',

  // Re-verify KYC
  'admin.users.action.reverify-kyc.title': 'Re-verify KYC',
  'admin.users.action.reverify-kyc.body': 'Sends the user a notification with a fresh MyID link. The current verification stays until they complete the new one.',
  'admin.users.action.reverify-kyc.cta': 'Send re-verification link',
  'admin.users.action.reverify-kyc.warning': '',
  'admin.users.action.reverify-kyc.success': '{name} will receive a re-verification link',

  // Reset device trust
  'admin.users.action.reset-devices.title': 'Reset device trust',
  'admin.users.action.reset-devices.body': 'Marks every device as untrusted. The user will see step-up authentication on the next login.',
  'admin.users.action.reset-devices.cta': 'Reset device trust',
  'admin.users.action.reset-devices.warning': '',
  'admin.users.action.reset-devices.success': 'Device trust reset',
  'admin.users.action.reset-devices.success-body': '{count} device(s) marked untrusted.',

  // Generate audit report
  'admin.users.action.generate-report.title': 'Generate audit report',
  'admin.users.action.generate-report.body': 'Compile a downloadable PDF of {name}\'s activity for the selected range.',
  'admin.users.action.generate-report.cta': 'Generate report',
  'admin.users.action.generate-report.from': 'From',
  'admin.users.action.generate-report.to': 'To',
  'admin.users.action.generate-report.toast-loading': 'Generating audit report…',
  'admin.users.action.generate-report.toast-ready': 'Audit report ready',
  'admin.users.action.generate-report.toast-ready-body': 'Download link expires in 24 hours.',

  // Untrust device
  'admin.users.action.untrust-device.title': 'Untrust device',
  'admin.users.action.untrust-device.body': 'The {platform} device …{deviceId} will require step-up authentication on its next session.',
  'admin.users.action.untrust-device.cta': 'Untrust',
  'admin.users.action.untrust-device.success': 'Device untrusted',

  // Freeze / unfreeze card
  'admin.users.action.freeze-card.title': 'Freeze card',
  'admin.users.action.freeze-card.body': 'Freezing {pan} ({bank}) blocks all new transactions until unfrozen. Existing in-flight transfers continue.',
  'admin.users.action.freeze-card.cta': 'Freeze card',
  'admin.users.action.freeze-card.success': 'Card {pan} frozen',
  'admin.users.action.unfreeze-card.title': 'Unfreeze card',
  'admin.users.action.unfreeze-card.body': 'Restores {pan} ({bank}) to active. The user can use the card immediately on the next login.',
  'admin.users.action.unfreeze-card.cta': 'Unfreeze card',
  'admin.users.action.unfreeze-card.success': 'Card {pan} unfrozen',

  // Hard-delete recipient
  'admin.users.action.delete-recipient.title': 'Delete saved recipient',
  'admin.users.action.delete-recipient.body': 'Removes the saved {destination} recipient {identifier}. Past transfers are unaffected.',
  'admin.users.action.delete-recipient.cta': 'Delete',
  'admin.users.action.delete-recipient.warning': "Recipients are hard-deleted — there is no audit value in retaining them. The user can re-save the same handle later.",
  'admin.users.action.delete-recipient.confirm-title': 'Confirm delete',
  'admin.users.action.delete-recipient.confirm-body': '{destination} recipient {identifier} will be permanently removed.',
  'admin.users.action.delete-recipient.confirm-cta': 'Yes, delete',
  'admin.users.action.delete-recipient.success': 'Recipient deleted',

  // help overlay group
  'admin.users.shortcuts.group': 'Users',

  // =========================================================================
  // Cards (cross-user list + full-page detail)
  // =========================================================================

  // Page header
  'admin.cards.title': 'Cards',
  'admin.cards.subtitle.counts': '{active} active · {frozen} frozen · {expired} expired',
  'admin.cards.search-placeholder': 'Search PAN, holder, bank, owner phone…',

  // Filter labels
  'admin.cards.filter.scheme': 'Scheme',
  'admin.cards.filter.status': 'Status',
  'admin.cards.filter.bank': 'Bank',
  'admin.cards.filter.country': 'Country',
  'admin.cards.filter.last-used': 'Last used',
  'admin.cards.filter.last-used.clear': 'Clear last-used filter',
  'admin.cards.filter.never-used': 'Never used',
  'admin.cards.filter.default-only': 'Default only',
  'admin.cards.filter.clear-all': 'Clear',
  'admin.cards.filter.search-placeholder': 'Search…',
  'admin.cards.filter.no-matches': 'No matches',

  // Schemes
  'admin.cards.scheme.uzcard': 'UzCard',
  'admin.cards.scheme.humo': 'Humo',

  // Statuses
  'admin.cards.status.active': 'Active',
  'admin.cards.status.frozen': 'Frozen',
  'admin.cards.status.expired': 'Expired',
  'admin.cards.status.removed': 'Removed',

  // Last-used display label (for the table/mobile-stack when lastUsedAt === null)
  'admin.cards.last-used.never': 'Never',

  // Table columns
  'admin.cards.column.card': 'Card',
  'admin.cards.column.bank': 'Bank',
  'admin.cards.column.holder': 'Holder',
  'admin.cards.column.country': 'Country',
  'admin.cards.column.owner': 'Owner',
  'admin.cards.column.status': 'Status',
  'admin.cards.column.default': 'Default',
  'admin.cards.column.last-used': 'Last used',
  'admin.cards.column.created': 'Created',

  // Row + table empty / row actions
  'admin.cards.row.actions': 'Card actions',
  'admin.cards.row.open-owner': 'Open owner profile',
  'admin.cards.row.open-transfers': 'View transfers on this card',
  'admin.cards.row.copy-token': 'Copy acquirer token',
  'admin.cards.unknown-owner': 'Unknown owner',
  'admin.cards.empty.title': 'No cards match these filters',
  'admin.cards.empty.body-no-data': 'There are no cards in the system yet.',
  'admin.cards.empty.body-filtered': 'Try clearing filters or broadening your search.',
  'admin.cards.result-count': '{shown} of {total} cards',

  // Pagination
  'admin.cards.pagination.page': 'Page {page} of {total}',
  'admin.cards.pagination.prev': 'Previous',
  'admin.cards.pagination.next': 'Next',

  // Page-header actions
  'admin.cards.action.export-csv': 'Export CSV',

  // Detail page
  'admin.cards.detail.back': 'Back to cards',
  'admin.cards.detail.default-badge': 'Default',
  'admin.cards.detail.section.card-details': 'Card details',
  'admin.cards.detail.section.owner': 'Owner',
  'admin.cards.detail.field.scheme': 'Scheme',
  'admin.cards.detail.field.bank': 'Bank',
  'admin.cards.detail.field.holder': 'Holder name',
  'admin.cards.detail.field.country': 'Issuer country',
  'admin.cards.detail.field.expiry': 'Expiry',
  'admin.cards.detail.field.tokenized-at': 'Tokenized at',
  'admin.cards.detail.field.last-used': 'Last used',
  'admin.cards.detail.field.token': 'Acquirer token',
  'admin.cards.detail.expiry-soon': 'Card expires within 60 days',
  'admin.cards.detail.expiry-expired': 'Card expired',
  'admin.cards.detail.expiry-soon-tag': 'Soon',
  'admin.cards.detail.owner.pinfl': 'PINFL',
  'admin.cards.detail.owner.pinfl-not-verified': 'PINFL not yet verified',
  'admin.cards.detail.owner.unknown': "Owner record not available — the user may have been hard-deleted.",
  'admin.cards.detail.owner.open-profile': 'Open user profile',
  'admin.cards.detail.recent-activity': 'Recent activity',
  'admin.cards.detail.recent-activity.count': '{count} transfers on this card',
  'admin.cards.detail.recent-activity.count-with-more':
    'Showing {shown} of {total} transfers on this card',
  'admin.cards.detail.recent-activity.empty': 'No transfers have used this card yet.',
  'admin.cards.detail.recent-activity.view-all-cta': 'View all {count} transfers',
  'admin.cards.detail.not-found.title': 'Card not found',
  'admin.cards.detail.not-found.body': "We couldn't find a card with id {id}. It may have been removed.",
  'admin.cards.detail.not-found.cta': 'Back to cards',

  // Privacy banner
  'admin.cards.privacy-banner':
    'Full PAN, CVV, and full holder identity are never displayed and cannot be retrieved by admin tools.',
  'admin.cards.privacy-banner.unlink-policy':
    'Card unlinking is user-initiated only — admins cannot remove a card on the user’s behalf.',

  // Action bar
  'admin.cards.action.freeze': 'Freeze',
  'admin.cards.action.unfreeze': 'Unfreeze',
  'admin.cards.action.copy-token': 'Copy token',
  'admin.cards.action.open-transfer-flow': 'Open transfers on this card',
  'admin.cards.action.reason-required': 'Reason (required)',

  // Freeze dialog
  'admin.cards.action.freeze.title': 'Freeze card',
  'admin.cards.action.freeze.body': 'Freezing {pan} ({bank}) blocks new transfers immediately. The user will be notified.',
  'admin.cards.action.freeze.severity-label': 'Severity',
  'admin.cards.action.freeze.severity.suspicious_activity': 'Suspicious activity',
  'admin.cards.action.freeze.severity.aml_flag': 'AML flag',
  'admin.cards.action.freeze.severity.user_request': 'User request',
  'admin.cards.action.freeze.severity.other': 'Other',
  'admin.cards.action.freeze.reason-placeholder': 'Why is this card being frozen? (min 10 chars)',
  'admin.cards.action.freeze.notify-note': 'The user will receive a push + in-app notification when the card is frozen.',

  // Unfreeze dialog
  'admin.cards.action.unfreeze.title': 'Unfreeze card',
  'admin.cards.action.unfreeze.body': 'Restoring {pan} ({bank}) re-enables transfers immediately. The user will be notified.',
  'admin.cards.action.unfreeze.previous-reason': 'Previously frozen for',
  'admin.cards.action.unfreeze.reason-placeholder': 'Why is this card being unfrozen? (min 10 chars)',
  'admin.cards.action.unfreeze.notify-note': 'The user will receive a push + in-app notification when the card is unfrozen.',

  // Toasts
  'admin.cards.toast.frozen': 'Card {pan} frozen',
  'admin.cards.toast.unfrozen': 'Card {pan} unfrozen',
  'admin.cards.toast.token-copied': 'Acquirer token copied to clipboard',
  'admin.cards.toast.action-failed': 'Action failed — please retry',
  'admin.cards.toast.exported': 'Cards CSV exported',
  'admin.cards.toast.exported-body': '{count} cards written to CSV',

  // Transfers card-context banner
  'admin.transfers.context.card-prefix': 'Showing transfers on card',
  'admin.transfers.context.open-card': 'Open card',
  'admin.transfers.context.clear': 'Clear filter',
  'admin.transfer-detail.back-link.card': 'Back to card transfers',

  // Transfers recipient-context banner
  'admin.transfers.context.recipient-prefix': 'Showing transfers to recipient',
  'admin.transfers.context.open-recipient': 'Open recipient',
  'admin.transfer-detail.back-link.recipient': 'Back to recipient',

  // ── Recipients (cross-user list + detail) ────────────────────────────
  'admin.recipients.title': 'Recipients',
  'admin.recipients.subtitle.counts': '{total} saved across {owners} users',
  'admin.recipients.search-placeholder': 'Search by identifier, name, or owner phone',
  'admin.recipients.action.export-csv': 'Export CSV',
  'admin.recipients.result-count': 'Showing {shown} of {total}',
  'admin.recipients.pagination.page': 'Page {page} of {total}',
  'admin.recipients.pagination.prev': 'Previous',
  'admin.recipients.pagination.next': 'Next',

  // Filters
  'admin.recipients.filter.destination': 'Destination',
  'admin.recipients.filter.favorites-only': 'Favorites only',
  'admin.recipients.filter.last-used': 'Last used',
  'admin.recipients.filter.last-used.clear': 'Clear last-used filter',
  'admin.recipients.filter.clear-all': 'Clear all',

  // Table columns
  'admin.recipients.column.destination': 'Destination',
  'admin.recipients.column.identifier': 'Identifier',
  'admin.recipients.column.display-name': 'Display name',
  'admin.recipients.column.nickname': 'Nickname',
  'admin.recipients.column.owner': 'Owner',
  'admin.recipients.column.favorite': 'Favorite',
  'admin.recipients.column.transfer-count': 'Transfers',
  'admin.recipients.column.last-used': 'Last used',
  'admin.recipients.column.created': 'Created',

  // Row / mobile-card meta
  'admin.recipients.favorite': 'Favorite',
  'admin.recipients.unknown-owner': 'Unknown owner',
  'admin.recipients.nickname-prefix': 'Nickname: {value}',
  'admin.recipients.row.actions': 'Recipient actions',
  'admin.recipients.row.open-owner': 'Open owner',
  'admin.recipients.row.open-transfers': 'Open transfers to this recipient',
  'admin.recipients.row.delete': 'Delete recipient',
  'admin.recipients.row.transfer-count': '{count} transfers',
  'admin.recipients.row.last-used': 'Last used {value}',
  'admin.recipients.row.added': 'Added {value}',
  'admin.recipients.row.owner-prefix': 'Owner: {value}',

  // Empty states
  'admin.recipients.empty.title': 'No recipients match these filters',
  'admin.recipients.empty.body-no-data': 'No saved recipients yet.',
  'admin.recipients.empty.body-filtered': 'Try clearing filters or broadening your search.',

  // Detail page
  'admin.recipients.detail.back': 'Back to recipients',
  'admin.recipients.detail.display-info': 'Display info',
  'admin.recipients.detail.nickname.empty': 'No nickname',
  'admin.recipients.detail.owner': 'Owner',
  'admin.recipients.detail.owner.unknown': 'Owner not found — the user may have been deleted.',
  'admin.recipients.detail.owner.pinfl': 'PINFL',
  'admin.recipients.detail.owner.pinfl-not-verified': 'PINFL not yet verified',
  'admin.recipients.detail.owner.open-profile': 'Open user profile',
  'admin.recipients.detail.usage': 'Usage',
  'admin.recipients.detail.view-all-cta': 'View all {count} transfers',
  'admin.recipients.detail.kpi.transfer-count': 'Total transfers',
  'admin.recipients.detail.kpi.total-volume': 'Total volume',
  'admin.recipients.detail.kpi.first-used': 'First used',
  'admin.recipients.detail.kpi.last-used': 'Last used',
  'admin.recipients.detail.last-transfers': 'Last 5 transfers',
  'admin.recipients.detail.last-transfers.empty': 'No transfer history available for this recipient.',
  'admin.recipients.detail.last-transfers.count-with-more': 'Showing {shown} of {total} transfers to this recipient',
  'admin.recipients.detail.chip.created': 'Created {value}',
  'admin.recipients.detail.chip.last-used': 'Last used {value}',
  'admin.recipients.detail.chip.nickname': 'Nickname: {value}',
  'admin.recipients.detail.not-found.title': 'Recipient not found',
  'admin.recipients.detail.not-found.body': "We couldn't find a recipient with id {id}. It may have been hard-deleted.",
  'admin.recipients.detail.not-found.cta': 'Back to recipients',

  // Hard-delete action / dialog
  'admin.recipients.action.hard-delete': 'Hard-delete recipient',
  'admin.recipients.action.hard-delete.title': 'Hard-delete saved recipient',
  'admin.recipients.action.hard-delete.body': 'Removes the saved {destination} recipient {identifier}. Past transfers are unaffected.',
  'admin.recipients.action.hard-delete.warning': 'Hard-delete is permanent. This row will be removed from the database. Past transfers to this recipient remain intact (the identifier is denormalized on the transfer row). Reason note (min 20 chars) required.',
  'admin.recipients.action.hard-delete.cta': 'Hard-delete',
  'admin.recipients.action.hard-delete.confirm-title': 'Confirm hard-delete',
  'admin.recipients.action.hard-delete.confirm-body': '{destination} recipient {identifier} will be permanently removed.',
  'admin.recipients.action.hard-delete.confirm-cta': 'Yes, hard-delete',
  'admin.recipients.action.reason-label': 'Reason note',
  'admin.recipients.action.reason-placeholder': 'Why is this recipient being hard-deleted? Be specific — this is auditable.',
  'admin.recipients.action.reason-required': 'Reason (required, min 20 chars)',
  'admin.recipients.action.reason-count': '{current} / {min} chars minimum',

  // Toasts
  'admin.recipients.toast.exported': 'Recipients CSV exported',
  'admin.recipients.toast.exported-body': '{count} recipients written to CSV',
  'admin.recipients.toast.deleted': 'Recipient deleted',
  'admin.recipients.toast.delete-failed': 'Delete failed — please retry',

  // ============================================================
  // FX Config — /finance/fx-config
  // ============================================================
  'admin.fx-config.title': 'FX Config',
  'admin.fx-config.subtitle': 'Manage UZS → CNY exchange rate',
  'admin.fx-config.action.update': 'Update rate',

  // Active rate card
  'admin.fx-config.active.title': 'Active rate',
  'admin.fx-config.active.subtitle': 'New transfers price against this rate immediately.',
  'admin.fx-config.active.empty': 'No active FX rate configured. Add one to begin pricing transfers.',
  'admin.fx-config.active.mid-rate': 'Mid rate',
  'admin.fx-config.active.spread': 'Spread',
  'admin.fx-config.active.client-rate': 'Client rate',
  'admin.fx-config.active.source': 'Source',
  'admin.fx-config.active.pair': 'Pair',
  'admin.fx-config.active.valid-from': 'Valid from',
  'admin.fx-config.active.valid-to': 'Valid to',
  'admin.fx-config.active.valid-to.open': 'open-ended',
  'admin.fx-config.active.in-flight-locked': 'Currently locked at this rate',
  'admin.fx-config.active.in-flight-locked.value': '{count} in-flight transfers',

  // Status badge
  'admin.fx-config.active.status.healthy': 'Healthy',
  'admin.fx-config.active.status.drifting': 'Drifting',
  'admin.fx-config.active.status.stale': 'Stale',

  // Source chip
  'admin.fx-config.source.central_bank': 'Central bank',
  'admin.fx-config.source.provider_x': 'Provider X',
  'admin.fx-config.source.manual': 'Manual',

  // Units
  'admin.fx-config.unit.uzs-per-cny': 'UZS/CNY',

  // Trend chart
  'admin.fx-config.chart.title': 'Trend',
  'admin.fx-config.chart.range-aria': 'Chart range',
  'admin.fx-config.chart.tab.24h': '24h',
  'admin.fx-config.chart.tab.7d': '7d',
  'admin.fx-config.chart.tab.30d': '30d',
  'admin.fx-config.chart.tab.90d': '90d',
  'admin.fx-config.chart.legend.mid': 'Mid rate',
  'admin.fx-config.chart.legend.client': 'Client rate',

  // Version history
  'admin.fx-config.history.title': 'Version history',
  'admin.fx-config.history.count': '{count} versions',
  'admin.fx-config.history.empty': 'No prior versions yet — only the active rate exists.',
  'admin.fx-config.history.column.effective-from': 'Effective from',
  'admin.fx-config.history.column.effective-to': 'Effective to',
  'admin.fx-config.history.column.mid-rate': 'Mid rate',
  'admin.fx-config.history.column.spread': 'Spread',
  'admin.fx-config.history.column.client-rate': 'Client rate',
  'admin.fx-config.history.column.source': 'Source',
  'admin.fx-config.history.column.active': 'Active',
  'admin.fx-config.history.column.created-by': 'Created by',
  'admin.fx-config.history.active.yes': 'Yes',
  'admin.fx-config.history.active.no': 'No',
  'admin.fx-config.history.row.actions.aria': 'Row actions',
  'admin.fx-config.history.row.action.view': 'View record',
  'admin.fx-config.history.row.action.collapse': 'Collapse record',
  'admin.fx-config.history.row.action.open-audit': 'Open audit log entry',
  'admin.fx-config.history.mobile.spread': 'spread {value}%',

  // Expanded record + diff
  'admin.fx-config.history.expanded.full-record': 'Full record',
  'admin.fx-config.history.expanded.diff': 'Diff vs previous version',
  'admin.fx-config.history.expanded.no-previous':
    'This is the earliest version — no previous record to compare.',
  'admin.fx-config.history.expanded.no-reason': 'No reason note recorded.',
  'admin.fx-config.history.expanded.field.id': 'ID',
  'admin.fx-config.history.expanded.field.pair': 'Pair',
  'admin.fx-config.history.expanded.field.mid-rate': 'Mid rate',
  'admin.fx-config.history.expanded.field.spread': 'Spread',
  'admin.fx-config.history.expanded.field.client-rate': 'Client rate',
  'admin.fx-config.history.expanded.field.source': 'Source',
  'admin.fx-config.history.expanded.field.created-by': 'Created by',
  'admin.fx-config.history.expanded.field.reason': 'Reason note',

  // Diff
  'admin.fx-config.diff.column.field': 'Field',
  'admin.fx-config.diff.column.previous': 'Previous',
  'admin.fx-config.diff.column.current': 'Current',
  'admin.fx-config.diff.column.new': 'New',
  'admin.fx-config.diff.row.mid-rate': 'Mid rate',
  'admin.fx-config.diff.row.spread': 'Spread %',
  'admin.fx-config.diff.row.client-rate': 'Client rate',
  'admin.fx-config.diff.row.source': 'Source',
  'admin.fx-config.diff.row.valid-from': 'Valid from',
  'admin.fx-config.diff.row.valid-to': 'Valid to',

  // Update page
  'admin.fx-config.update.title': 'Update FX rate',
  'admin.fx-config.update.back': 'Back to FX Config',
  'admin.fx-config.update.warning':
    'This creates a new fx_rates version. The current rate stays valid for in-flight transfers — only new transfers will use the new rate.',
  'admin.fx-config.update.diff': 'Diff preview',
  'admin.fx-config.update.diff.subtitle.empty':
    'Enter a mid rate and spread to see the diff.',
  'admin.fx-config.update.show-diff': 'Show diff',
  'admin.fx-config.update.section.source': 'Source',
  'admin.fx-config.update.section.rates': 'Rates',
  'admin.fx-config.update.section.window': 'Validity window',
  'admin.fx-config.update.section.reason': 'Reason note',
  'admin.fx-config.update.reason-required': 'Reason note required (min 20 chars)',
  'admin.fx-config.update.confirm.title': 'Update rate now?',
  'admin.fx-config.update.confirm.body':
    '{count} transfers currently locked at the old rate will not be affected.',
  'admin.fx-config.update.confirm.cta': 'Yes, update rate',

  // Form fields
  'admin.fx-config.form.source.label': 'Source',
  'admin.fx-config.form.source.help.central_bank':
    'Central-bank-fetched rates lock the rate inputs below. Switch to Manual to override.',
  'admin.fx-config.form.source.help.provider_x':
    'Provider X feed. Edits are still allowed — values prefilled from the current active rate.',
  'admin.fx-config.form.source.help.manual':
    'Manual override. Compliance review required for spread changes above the configured band.',
  'admin.fx-config.form.mid-rate.label': 'Mid rate (UZS / CNY)',
  'admin.fx-config.form.mid-rate.help':
    'Stored at numeric(20,8). Display rounds to 2 decimals.',
  'admin.fx-config.form.spread.label': 'Spread %',
  'admin.fx-config.form.spread.help':
    'Stored at numeric(8,4). Healthy ≤ 1.5%, Drifting up to 2.0%.',
  'admin.fx-config.form.client-rate.label': 'Client rate (auto-computed)',
  'admin.fx-config.form.client-rate.help':
    'Formula: mid_rate × (1 + spread_pct / 100). This is the rate offered to users.',
  'admin.fx-config.form.valid-from.label': 'Valid from',
  'admin.fx-config.form.valid-to.label': 'Valid to',
  'admin.fx-config.form.valid-to.help':
    'Leave empty for an open-ended window. The previous active row will be closed automatically.',
  'admin.fx-config.form.reason.label': 'Reason note',
  'admin.fx-config.form.reason.placeholder':
    'Why are you updating the rate? Reference any compliance ticket or PBoC / CBU communication.',
  'admin.fx-config.form.reason.help': 'Reason note recorded — meets minimum length.',

  // (datetime keys lifted to common.datetime.* — see top of file's common.* block)

  // Toasts
  'admin.fx-config.update.toast.success.title': 'Rate updated',
  'admin.fx-config.update.toast.success.body': 'New version {id} is now active.',
  'admin.fx-config.update.toast.error.title': 'Update failed',
  'admin.fx-config.update.toast.error.body':
    'The new rate could not be applied. Please retry — your inputs were preserved.',

  // ====================================================================
  // Commission Rules — /finance/commissions
  // ====================================================================
  'admin.commissions.title': 'Commission Rules',
  'admin.commissions.subtitle': 'Pricing rules for transfer fees',

  // Tabs
  'admin.commissions.tab.personal': 'Personal',
  'admin.commissions.tab.corporate': 'Corporate',

  // Active rule card
  'admin.commissions.active.title': 'Active version',
  'admin.commissions.active.empty': 'No active commission rule for this account type.',
  'admin.commissions.active.min-pct': 'Min %',
  'admin.commissions.active.max-pct': 'Max %',
  'admin.commissions.active.min-fee': 'Min fee',
  'admin.commissions.active.volume-threshold': 'Volume threshold',
  'admin.commissions.active.corporate-pct': 'Corporate %',
  'admin.commissions.active.effective-from': 'Effective from',
  'admin.commissions.active.effective-to': 'Effective to',
  'admin.commissions.active.effective-to.open': 'open-ended',
  'admin.commissions.active.created-by': 'Created by',
  'admin.commissions.action.new-version': 'New version',

  // Worked example
  'admin.commissions.example.title': 'Worked example',
  'admin.commissions.example.subtitle': 'How the rule applies to a sample 5,000,000 UZS transfer.',
  'admin.commissions.example.empty': 'Worked example unavailable — no active rule.',
  'admin.commissions.example.sample-amount': 'Sample transfer amount',
  'admin.commissions.example.commission-pct.label': 'Commission %',
  'admin.commissions.example.commission-pct.detail':
    'Midpoint of the [{minPct}% – {maxPct}%] band — illustrative typical charge.',
  'admin.commissions.example.commission-uzs.label': 'Commission UZS',
  'admin.commissions.example.min-fee.label': 'Min-fee floor',
  'admin.commissions.example.min-fee.applies': 'Floor applies — total raised to min fee.',
  'admin.commissions.example.min-fee.doesnt-apply': 'Does not apply — commission > floor.',
  'admin.commissions.example.total-fee.label': 'Total fee',
  'admin.commissions.example.above-threshold.title': 'Above volume threshold',
  'admin.commissions.example.above-threshold.body':
    'When the customer crosses the {threshold} volume threshold, the commission drops to corporate_pct ({corporatePct}%).',
  'admin.commissions.example.above-threshold.commission-uzs.label': 'Discounted commission',

  // Version history
  'admin.commissions.history.title': 'Version history',
  'admin.commissions.history.count': '{count} versions',
  'admin.commissions.history.empty': 'No previous versions.',
  'admin.commissions.history.column.version': 'Version',
  'admin.commissions.history.column.effective-from': 'Effective from',
  'admin.commissions.history.column.effective-to': 'Effective to',
  'admin.commissions.history.column.min-pct': 'Min %',
  'admin.commissions.history.column.max-pct': 'Max %',
  'admin.commissions.history.column.min-fee': 'Min fee',
  'admin.commissions.history.column.active': 'Active',
  'admin.commissions.history.active.yes': 'Active',
  'admin.commissions.history.active.no': '—',
  'admin.commissions.history.row.actions.aria': 'Row actions',
  'admin.commissions.history.row.action.view': 'View record',
  'admin.commissions.history.row.action.collapse': 'Collapse record',
  'admin.commissions.history.row.action.open-audit': 'Open audit log entry',
  'admin.commissions.history.expanded.full-record': 'Full record',
  'admin.commissions.history.expanded.diff': 'Diff vs previous version',
  'admin.commissions.history.expanded.no-previous': 'This is the first version — no diff.',
  'admin.commissions.history.expanded.field.id': 'ID',
  'admin.commissions.history.expanded.field.version': 'Version',
  'admin.commissions.history.expanded.field.account-type': 'Account type',
  'admin.commissions.history.expanded.field.min-pct': 'Min %',
  'admin.commissions.history.expanded.field.max-pct': 'Max %',
  'admin.commissions.history.expanded.field.min-fee': 'Min fee',
  'admin.commissions.history.expanded.field.volume-threshold': 'Volume threshold',
  'admin.commissions.history.expanded.field.corporate-pct': 'Corporate %',
  'admin.commissions.history.expanded.field.created-by': 'Created by',
  'admin.commissions.history.expanded.field.reason': 'Reason',
  'admin.commissions.history.mobile.min-fee': 'min',

  // Diff (preview + history-expanded)
  'admin.commissions.diff.column.field': 'Field',
  'admin.commissions.diff.column.current': 'Current',
  'admin.commissions.diff.column.previous': 'Previous',
  'admin.commissions.diff.column.new': 'New',
  'admin.commissions.diff.row.min-pct': 'Min %',
  'admin.commissions.diff.row.max-pct': 'Max %',
  'admin.commissions.diff.row.min-fee': 'Min fee',
  'admin.commissions.diff.row.volume-threshold': 'Volume threshold',
  'admin.commissions.diff.row.corporate-pct': 'Corporate %',
  'admin.commissions.diff.row.effective-from': 'Effective from',
  'admin.commissions.diff.row.effective-to': 'Effective to',

  // New-version page
  'admin.commissions.new.title.personal': 'New commission rule version (Personal)',
  'admin.commissions.new.title.corporate': 'New commission rule version (Corporate)',
  'admin.commissions.new.back': 'Back to commission rules',
  'admin.commissions.new.warning':
    'This creates a new version. The current rule remains active until this new version’s effective_from is reached.',
  'admin.commissions.new.section.bands': 'Commission bands',
  'admin.commissions.new.section.corporate': 'Corporate-tier discount',
  'admin.commissions.new.section.window': 'Validity window',
  'admin.commissions.new.section.reason': 'Reason note',
  'admin.commissions.new.help.min-fee':
    'Minimum charge applied when the percentage commission would otherwise fall below this floor.',
  'admin.commissions.new.help.volume-threshold':
    'Above this monthly volume (USD), the corporate customer pays the corporate_pct rate instead of the standard band.',
  'admin.commissions.new.help.corporate-pct':
    'Discounted commission applied above the volume threshold. Must be ≤ min_pct (corporate gets a discount).',
  'admin.commissions.new.help.effective-to':
    'Leave empty for an open-ended window — the most common choice.',
  'admin.commissions.new.validation.min-le-max': 'min_pct must be ≤ max_pct.',
  'admin.commissions.new.validation.corporate-le-min':
    'corporate_pct must be ≤ min_pct (corporate is a discount, not a markup).',
  'admin.commissions.new.validation.from-before-to':
    'Effective-from must be earlier than Effective-to.',
  'admin.commissions.new.reason.placeholder':
    'Why are you creating this version? Reference any pricing review, regulator notice, or compliance ticket.',
  'admin.commissions.new.reason-help': 'Reason note recorded — meets minimum length.',
  'admin.commissions.new.reason-required': 'Reason note required (minimum 20 characters).',
  'admin.commissions.new.show-diff': 'Show diff & worked example',
  'admin.commissions.new.diff': 'Diff preview',
  'admin.commissions.new.diff.empty': 'No changes yet — edit a field to preview the diff.',
  'admin.commissions.new.action.create': 'Create version',
  'admin.commissions.new.confirm.title': 'Activate new version now?',
  'admin.commissions.new.confirm.body':
    'Transfers created after {effectiveFrom} will use the new rule. The old version remains read-only in history.',
  'admin.commissions.new.confirm.cta': 'Activate',
  'admin.commissions.new.toast.success.title': 'Commission rule version created',
  'admin.commissions.new.toast.success.body': '{accountType} {version} is now active.',
  'admin.commissions.new.toast.error.title': 'Could not create version',
  'admin.commissions.new.toast.error.body':
    'The new rule could not be applied. Please retry — your inputs were preserved.',

  // ── Audit Log ──────────────────────────────────────────────────────
  'admin.audit-log.title': 'Audit Log',
  'admin.audit-log.subtitle': 'Append-only record of all admin and system actions.',
  'admin.audit-log.banner.append-only':
    'Append-only. Records cannot be edited or deleted. Export for offline review.',

  'admin.audit-log.action.export': 'Export CSV',

  // Filter bar
  'admin.audit-log.filter.date-range': 'Date',
  'admin.audit-log.filter.actor-type': 'Actor type',
  'admin.audit-log.filter.admin-actor': 'Admin actor',
  'admin.audit-log.filter.entity-type': 'Entity type',
  'admin.audit-log.filter.action': 'Action',
  'admin.audit-log.filter.entity-ref': 'Entity reference',
  'admin.audit-log.filter.entity-ref-placeholder': 'Paste a transfer-id, user-id, card-id…',
  'admin.audit-log.filter.admin-search-placeholder': 'Search admin name or id',
  'admin.audit-log.filter.admin-no-matches': 'No admin actor matches.',
  'admin.audit-log.filter.clear-all': 'Clear all',
  'admin.audit-log.filter.clear-search': 'Clear search',

  // Actor type chips + filter labels
  'admin.audit-log.actor-type.system': 'System',
  'admin.audit-log.actor-type.user': 'User',
  'admin.audit-log.actor-type.provider': 'Provider',
  'admin.audit-log.actor-type.admin': 'Admin',

  // Entity type labels
  'admin.audit-log.entity-type.transfer': 'Transfer',
  'admin.audit-log.entity-type.user': 'User',
  'admin.audit-log.entity-type.card': 'Card',
  'admin.audit-log.entity-type.kyc': 'KYC',
  'admin.audit-log.entity-type.aml': 'AML',
  'admin.audit-log.entity-type.blacklist': 'Blacklist',
  'admin.audit-log.entity-type.fx': 'FX rate',
  'admin.audit-log.entity-type.commission': 'Commission rule',
  'admin.audit-log.entity-type.service': 'Service',
  'admin.audit-log.entity-type.app_version': 'App version',
  'admin.audit-log.entity-type.notification': 'Notification',

  // Action labels (12 spec values)
  'admin.audit-log.action.created': 'Created',
  'admin.audit-log.action.updated': 'Updated',
  'admin.audit-log.action.deleted': 'Deleted',
  'admin.audit-log.action.status_changed': 'Status changed',
  'admin.audit-log.action.approved': 'Approved',
  'admin.audit-log.action.rejected': 'Rejected',
  'admin.audit-log.action.cleared': 'Cleared',
  'admin.audit-log.action.escalated': 'Escalated',
  'admin.audit-log.action.frozen': 'Frozen',
  'admin.audit-log.action.unfrozen': 'Unfrozen',
  'admin.audit-log.action.reversed': 'Reversed',
  'admin.audit-log.action.failed': 'Failed',

  // Table column headers
  'admin.audit-log.column.timestamp': 'Timestamp',
  'admin.audit-log.column.actor-type': 'Actor type',
  'admin.audit-log.column.actor': 'Actor',
  'admin.audit-log.column.action': 'Action',
  'admin.audit-log.column.entity-type': 'Entity',
  'admin.audit-log.column.entity-ref': 'Reference',
  'admin.audit-log.column.transition': 'From → To',
  'admin.audit-log.column.context': 'Context',

  // Expanded row
  'admin.audit-log.expanded.timestamp': 'Timestamp',
  'admin.audit-log.expanded.actor': 'Actor',
  'admin.audit-log.expanded.actor-name': 'Name',
  'admin.audit-log.expanded.actor-id': 'Id',
  'admin.audit-log.expanded.actor-phone': 'Phone',
  'admin.audit-log.expanded.actor-ip': 'IP',
  'admin.audit-log.expanded.actor-device': 'Device',
  'admin.audit-log.expanded.entity': 'Entity reference',
  'admin.audit-log.expanded.copy-entity': 'Copy entity id',
  'admin.audit-log.expanded.open-entity': 'Open entity',
  'admin.audit-log.expanded.reason': 'Reason note',
  'admin.audit-log.expanded.context': 'Context (JSON)',
  'admin.audit-log.expanded.copy-context': 'Copy',
  'admin.audit-log.expanded.copied': 'Copied',
  'admin.audit-log.expanded.related': 'View {count} other events for this entity',

  // Pagination
  'admin.audit-log.pagination.showing': 'Showing {start}–{end} of {total}',
  'admin.audit-log.pagination.prev': 'Previous',
  'admin.audit-log.pagination.next': 'Next',

  // Export dialog
  'admin.audit-log.export.title': 'Export audit log',
  'admin.audit-log.export.subtitle':
    '{count} events match the active filter and will be included.',
  'admin.audit-log.export.date-range': 'Date range (from filter)',
  'admin.audit-log.export.date-range-help':
    'Locked to the page filter. Adjust the filter and re-open this dialog to change.',
  'admin.audit-log.export.format': 'Format',
  'admin.audit-log.export.format-csv-hint': 'Spreadsheet-friendly, one row per event.',
  'admin.audit-log.export.format-ndjson-hint': 'One JSON object per line; keeps full structure.',
  'admin.audit-log.export.include-context': 'Include context jsonb',
  'admin.audit-log.export.include-context-help':
    'Off by default — context can grow large. Toggle on for forensic exports.',
  'admin.audit-log.export.size-warning':
    'Estimated payload ≥ {mb} MB with context — generate may take a moment.',
  'admin.audit-log.export.cta': 'Generate export',
  'admin.audit-log.export.cta-busy': 'Generating…',
  'admin.audit-log.export.toast.success.title': 'Export ready',
  'admin.audit-log.export.toast.success.body':
    '{count} events exported as {format}. Check your downloads folder.',
  'admin.audit-log.export.toast.error.title': 'Could not export',
  'admin.audit-log.export.toast.error.body':
    'The export could not be generated. Please retry.',

  // Empty + error states
  'admin.audit-log.empty.no-results.title': 'No events match these filters',
  'admin.audit-log.empty.no-results.body':
    'Try widening the date range or removing actor / entity / action filters.',
  'admin.audit-log.empty.no-data.title': 'No audit events yet',
  'admin.audit-log.empty.no-data.body':
    'As admins and the system take actions, they appear here.',

  // ===================================================================
  // Blacklist surface (Phase 12) — /compliance/blacklist + /new + /:id
  // ===================================================================
  'admin.blacklist.title': 'Blacklist',
  'admin.blacklist.subtitle':
    'Block identifiers across signup, login, card linking, and transfers.',
  'admin.blacklist.action.add': 'Add entry',

  // Tabs
  'admin.blacklist.tab.phone': 'Phone',
  'admin.blacklist.tab.pinfl': 'PINFL',
  'admin.blacklist.tab.device': 'Device',
  'admin.blacklist.tab.ip': 'IP',
  'admin.blacklist.tab.card-token': 'Card token',

  // Type labels (capitalized — used in detail header chip + selects)
  'admin.blacklist.type.phone': 'Phone',
  'admin.blacklist.type.pinfl': 'PINFL',
  'admin.blacklist.type.device': 'Device',
  'admin.blacklist.type.ip': 'IP',
  'admin.blacklist.type.card-token': 'Card token',

  // Severity
  'admin.blacklist.severity.suspected': 'Suspected',
  'admin.blacklist.severity.confirmed': 'Confirmed',

  // Status chip
  'admin.blacklist.status.active': 'Active',
  'admin.blacklist.status.expired': 'Expired',
  'admin.blacklist.status.expiring-soon': 'Expiring soon',

  // Filter bar
  'admin.blacklist.filter.search': 'Search',
  'admin.blacklist.filter.clear-search': 'Clear search',
  'admin.blacklist.filter.clear-all': 'Clear filters',
  'admin.blacklist.filter.clear-created': 'Clear created date filter',
  'admin.blacklist.filter.status': 'Status',
  'admin.blacklist.filter.added-by': 'Added by',
  'admin.blacklist.filter.created': 'Added in',
  'admin.blacklist.filter.search-placeholder.phone':
    'Search by phone or reason',
  'admin.blacklist.filter.search-placeholder.pinfl':
    'Search by PINFL or reason',
  'admin.blacklist.filter.search-placeholder.device':
    'Search by device fingerprint or reason',
  'admin.blacklist.filter.search-placeholder.ip':
    'Search by IP address or reason',
  'admin.blacklist.filter.search-placeholder.card-token':
    'Search by card token or reason',

  // Table column headers
  'admin.blacklist.column.identifier': 'Identifier',
  'admin.blacklist.column.reason': 'Reason',
  'admin.blacklist.column.added-by': 'Added by',
  'admin.blacklist.column.created': 'Created',
  'admin.blacklist.column.expires': 'Expires',
  'admin.blacklist.column.affecting': 'Currently affecting',

  // Row kebab actions
  'admin.blacklist.row.actions': 'Row actions',
  'admin.blacklist.row.open': 'Open entry',
  'admin.blacklist.row.affecting-n': '{count} affecting',

  // Expiry cell
  'admin.blacklist.expires.never': 'Never',
  'admin.blacklist.expires.expired': 'Expired',
  'admin.blacklist.expires.in-days': 'In {count} days',
  'admin.blacklist.expires.in-hours': 'In {count}h',

  // Empty state
  'admin.blacklist.empty.body':
    'No entries of this type. Add one to start blocking.',

  // Add entry page
  'admin.blacklist.add.back': 'Back to blacklist',
  'admin.blacklist.add.title': 'Add blacklist entry',
  'admin.blacklist.add.subtitle':
    'Block an identifier from signup, login, card linking, or transfers. Takes effect immediately on save.',
  'admin.blacklist.add.section.identity': 'Identity',
  'admin.blacklist.add.section.identity-desc':
    'Pick the identifier type and the value to block.',
  'admin.blacklist.add.section.justification': 'Justification',
  'admin.blacklist.add.section.justification-desc':
    'Explain why this entry is being added — this is recorded in the audit log.',
  'admin.blacklist.add.type': 'Type',
  'admin.blacklist.add.identifier': 'Identifier',
  'admin.blacklist.add.reason': 'Reason',
  'admin.blacklist.add.severity': 'Severity',
  'admin.blacklist.add.expires-at': 'Expires at',
  'admin.blacklist.add.submit': 'Add to blacklist',

  'admin.blacklist.add.placeholder.phone': '+998 XX XXX XX XX',
  'admin.blacklist.add.placeholder.pinfl': '14 digits',
  'admin.blacklist.add.placeholder.device': 'Hex device fingerprint',
  'admin.blacklist.add.placeholder.ip': '192.0.2.10 or 2001:db8::1',
  'admin.blacklist.add.placeholder.card-token': 'tok_…',

  'admin.blacklist.add.severity.suspected-desc':
    'Watching — may turn into a confirmed block after investigation.',
  'admin.blacklist.add.severity.confirmed-desc':
    'Hard block — confirmed fraud / sanctions / abuse.',

  'admin.blacklist.add.help.reason':
    '{count} / {min} characters minimum.',
  'admin.blacklist.add.help.expires-at':
    'Leave empty for an indefinite block.',

  'admin.blacklist.add.validation.identifier-required':
    'Identifier is required.',
  'admin.blacklist.add.validation.phone-format':
    'Enter an E.164 phone number (must start with +).',
  'admin.blacklist.add.validation.pinfl-format':
    'PINFL must be exactly 14 digits.',
  'admin.blacklist.add.validation.device-format':
    'Device fingerprint must be a hex string of at least 8 characters.',
  'admin.blacklist.add.validation.ip-format':
    'Enter a valid IPv4 or IPv6 address.',
  'admin.blacklist.add.validation.card-format':
    'Card token must be at least 8 characters.',

  'admin.blacklist.add.warning.user-match':
    'Match found: {name} ({phone}), {tier}, last login {lastLogin}. Adding this entry will prevent them from signing in.',
  'admin.blacklist.add.warning.card-match':
    'Match found: {maskedPan} on {bank}. Adding this entry will block this card from being used.',
  'admin.blacklist.add.warning.duplicate':
    'This identifier is already blacklisted.',

  'admin.blacklist.add.confirm.title': 'Add this blacklist entry now?',
  'admin.blacklist.add.confirm.body':
    'This action takes effect immediately. Affected users / cards will be blocked at the next interaction.',
  'admin.blacklist.add.confirm.cta': 'Add to blacklist',

  // Pre-add check panel
  'admin.blacklist.pre-add.title': 'Pre-add check',
  'admin.blacklist.pre-add.idle':
    'Start typing an identifier to see whether it matches a current user, card, or existing blacklist entry.',
  'admin.blacklist.pre-add.duplicate-body':
    'Open the existing entry to extend or edit it instead of adding a duplicate.',
  'admin.blacklist.pre-add.no-match.title': 'No active match',
  'admin.blacklist.pre-add.no-match.body':
    'No current user or card matches this identifier. Block will only catch future activity.',
  'admin.blacklist.pre-add.no-store.title': 'No live device / session match',
  'admin.blacklist.pre-add.no-store.body':
    'Device and IP matches are evaluated at request time — there is no canonical user/device store to query here.',
  'admin.blacklist.pre-add.last-login.never': 'never',
  'admin.blacklist.pre-add.open-user': 'Open user profile',
  'admin.blacklist.pre-add.open-card': 'Open card detail',

  // Detail page
  'admin.blacklist.detail.back': 'Back to blacklist',
  'admin.blacklist.detail.entry': 'Entry',
  'admin.blacklist.detail.impact': 'Impact',
  'admin.blacklist.detail.type': 'Type',
  'admin.blacklist.detail.identifier': 'Identifier',
  'admin.blacklist.detail.severity': 'Severity',
  'admin.blacklist.detail.reason': 'Reason',
  'admin.blacklist.detail.added-by': 'Added by',
  'admin.blacklist.detail.created': 'Created at',
  'admin.blacklist.detail.expires': 'Expires at',
  'admin.blacklist.detail.not-found':
    'Blacklist entry not found. It may have been removed.',

  'admin.blacklist.impact.currently-blocking':
    'Currently blocked by this entry.',
  'admin.blacklist.impact.no-current-effect':
    'No matching user or card in current data — the block will catch new activity.',
  'admin.blacklist.impact.attempts-30d':
    '{count} blocked sign-in attempts in the last 30 days.',
  'admin.blacklist.impact.affected-user': 'Affected user',
  'admin.blacklist.impact.affected-card': 'Affected card',
  'admin.blacklist.impact.noun.users': 'user',
  'admin.blacklist.impact.noun.devices': 'device',
  'admin.blacklist.impact.noun.sessions': 'session',
  'admin.blacklist.impact.noun.cards': 'card',

  // Detail action labels
  'admin.blacklist.action.edit-reason': 'Edit reason',
  'admin.blacklist.action.extend': 'Extend expiry',
  'admin.blacklist.action.remove': 'Remove',

  // Edit reason dialog
  'admin.blacklist.edit-reason.title': 'Edit blacklist entry reason',
  'admin.blacklist.edit-reason.body':
    'Update the justification for this entry. The previous reason is preserved in the audit log.',
  'admin.blacklist.edit-reason.field.reason': 'New reason',
  'admin.blacklist.edit-reason.field.change-note':
    'Why are you updating this reason?',
  'admin.blacklist.edit-reason.help.reason':
    'Reason must be at least 30 characters.',
  'admin.blacklist.edit-reason.help.change-note':
    '{count} / {min} characters — explain the change.',
  'admin.blacklist.edit-reason.confirm': 'Save new reason',

  // Extend expiry dialog
  'admin.blacklist.extend.title': 'Extend or change expiry',
  'admin.blacklist.extend.body':
    'Pick a new expiry date and time. Leave empty for an indefinite block.',
  'admin.blacklist.extend.field.expires-at': 'New expiry',
  'admin.blacklist.extend.help':
    'Set in the future, or clear to make this entry indefinite.',
  'admin.blacklist.extend.confirm': 'Save expiry',

  // Remove dialog
  'admin.blacklist.remove.title': 'Remove this blacklist entry?',
  'admin.blacklist.remove.body':
    'This is a hard delete. The entry is gone from the live blacklist, but the action is recorded in the audit log. This cannot be undone.',
  'admin.blacklist.remove.field.reason': 'Why is this entry being removed?',
  'admin.blacklist.remove.help':
    '{count} / {min} characters minimum.',
  'admin.blacklist.remove.confirm': 'Remove entry',

  // Toasts
  'admin.blacklist.toast.added.title': 'Entry added.',
  'admin.blacklist.toast.added.error.title': 'Could not add entry.',
  'admin.blacklist.toast.added.error.body':
    'Something went wrong saving this entry. Try again.',
  'admin.blacklist.toast.removed.title': 'Entry removed.',
  'admin.blacklist.toast.removed.error': 'Entry could not be removed.',
  'admin.blacklist.toast.edit-reason.title': 'Reason updated.',
  'admin.blacklist.toast.edit-reason.error': 'Reason could not be updated.',
  'admin.blacklist.toast.extend.title': 'Expiry updated.',
  'admin.blacklist.toast.extend.error': 'Expiry could not be updated.',

  // ── KYC Tiers (compliance/kyc-tiers) — read-only reference ─────────
  'admin.kyc-tiers.title': 'KYC Tier Limits',
  'admin.kyc-tiers.subtitle':
    'Tier definitions that drive every transfer-limit decision.',

  // Tier card — labels
  'admin.kyc-tiers.card.per-tx': 'Per-transaction limit',
  'admin.kyc-tiers.card.daily': 'Daily limit',
  'admin.kyc-tiers.card.monthly': 'Monthly limit',
  'admin.kyc-tiers.card.max-cards': 'Max linked cards',
  'admin.kyc-tiers.card.myid-required': 'MyID required',

  // Tier card — names, descriptions, gate notes
  'admin.kyc-tiers.tier.tier_0.name': 'Just signed up',
  'admin.kyc-tiers.tier.tier_0.description':
    'Account created. Phone OTP is the first gate.',
  'admin.kyc-tiers.tier.tier_0.gate':
    'Cannot access the app. Phone OTP verification is required before sign-in.',
  'admin.kyc-tiers.tier.tier_1.name': 'Phone verified',
  'admin.kyc-tiers.tier.tier_1.description': 'Phone OTP completed.',
  'admin.kyc-tiers.tier.tier_1.gate':
    'View-only access — services and FX rates visible. No card linking, no recipients, no transfers until MyID verification.',
  'admin.kyc-tiers.tier.tier_2.name': 'MyID verified',
  'admin.kyc-tiers.tier.tier_2.description':
    'Full identity verification via MyID. Highest limits and Visa / Mastercard eligibility.',

  // Live distribution card
  'admin.kyc-tiers.impact.title': 'Live distribution',
  'admin.kyc-tiers.impact.subtitle':
    'Derived from current users + in-flight transfers in this environment.',
  'admin.kyc-tiers.impact.total-users': 'Total users',
  'admin.kyc-tiers.impact.active-transfers': 'Active transfers right now',
  'admin.kyc-tiers.impact.avg-amount': 'Avg per-tx amount',
  'admin.kyc-tiers.impact.no-active': 'No transfers in flight.',
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
