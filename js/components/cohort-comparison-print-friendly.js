define(['jquery', 'knockout', 'text!./cohort-comparison-print-friendly.html', 'appConfig', 'cohortcomparison/ComparativeCohortAnalysis', 'nvd3', 'css!./styles/nv.d3.min.css'],
	function ($, ko, view, config, cohortComparison, options) {
		function cohortComparisonPrintFriendly(params) {
			var self = this;
			self.config = config;
			self.loading = ko.observable(true);
            self.cohortComparison = params.cohortComparison;
		}

		var component = {
			viewModel: cohortComparisonPrintFriendly,
			template: view
		};

		ko.components.register('cohort-comparison-print-friendly', component);
		return component;
	});