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
  'admin.overview.subtitle': 'Real-time view of operations',
  'admin.overview.kpi.transfers-today': 'Transfers today',
  'admin.overview.kpi.volume-today': 'Volume today',
  'admin.overview.kpi.pending-kyc': 'Pending KYC',
  'admin.overview.kpi.open-aml': 'Open AML flags',
  'admin.overview.kpi.delta.up': 'vs yesterday',
  'admin.overview.kpi.delta.down': 'vs yesterday',
  'admin.overview.status-breakdown.title': 'Status breakdown',
  'admin.overview.status-breakdown.subtitle': 'Last 24 hours',
  'admin.overview.throughput.title': 'Throughput',
  'admin.overview.throughput.subtitle': 'Last 60 minutes',
  'admin.overview.services.title': 'Services & health',
  'admin.overview.services.subtitle': 'Live status of payment rails',
  'admin.overview.recent-activity.title': 'Recent activity',
  'admin.overview.recent-activity.subtitle': 'Latest 10 transfers',
  'admin.overview.recent-activity.column.user': 'User',
  'admin.overview.recent-activity.column.card': 'Card',
  'admin.overview.recent-activity.column.amount': 'Amount',
  'admin.overview.recent-activity.column.recipient': 'Recipient',
  'admin.overview.recent-activity.column.status': 'Status',
  'admin.overview.recent-activity.column.time': 'Time',
  'admin.overview.recent-activity.empty.title': 'No transfers yet',
  'admin.overview.recent-activity.empty.body': 'When transfers start flowing, they will appear here.',

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
  'common.errors.PROVIDER_UNAVAILABLE.title': 'Service unavailable',
  'common.errors.PROVIDER_UNAVAILABLE.body': 'The payment provider is temporarily unavailable.',
  'common.errors.RECIPIENT_INVALID.title': 'Invalid recipient',
  'common.errors.RECIPIENT_INVALID.body': 'Verify the Alipay or WeChat handle and try again.',
  'common.errors.SANCTIONS_HIT.title': 'Under review',
  'common.errors.SANCTIONS_HIT.body':
    'We are reviewing this transfer for compliance. We will notify you within 24 hours.',
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
