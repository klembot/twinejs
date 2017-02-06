// Patches QuotaGauge to keep itself hidden.

module.exports = QuotaGauge => {
	QuotaGauge.options.template = '';
	QuotaGauge.options.created = null;
};
