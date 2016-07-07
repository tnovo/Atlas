define(['knockout', '../CriteriaTypes','../CriteriaGroup', '../AdditionalCriteria', '../options', 'text!./CriteriaGroupTemplate.html'], function (ko, criteriaTypes, CriteriaGroup, AdditionalCriteria, options, template) {

	function CriteriaGroupViewModel(params) {
		var self = this;

		var addCriteriaActions = [
			{
				text: "Add Condition Filters",
				selected: false,
				description: "Find patients with specific diagnoses.",
				action: function () { self.addConditionCriteria(); }
			},
			{
				text: "Add Condition Era Filters",
				selected: false,
				description: "Find patients with specific diagnosis era.",
				action: function () { self.addConditionEraCriteria(); }
			},
			{
				text: "Add Drug Filters",
				selected: false,
				description: "Find patients with exposure to specific drugs or drug classes.",
				action: function () { self.addDrugExposureCriteria(); }
			},
			{
				text: "Add Drug Era Filters",
				selected: false,
				description: "Find patients with with exposure to drugs over time.",
				action: function () { self.addDrugEraCriteria(); }
			},
			{
				text: "Add Dose Era Filters",
				selected: false,
				description: "Find patients with dose eras.",
				action: function () { self.addDoseEraCriteria(); }
			},
			{
				text: "Add Procedure Filters",
				selected: false,
				description: "Find patients that experienced a specific procedure.",
				action: function () { self.addProcedureCriteria(); }
			},
			{
				text: "Add Observation Filters",
				selected: false,
				description: "Find patients based on lab tests or other observations.",
				action: function () { self.addObservationCriteria(); }
			},
			{
				text: "Add Visit Filters",
				selected: false,
				description: "Find patients based on visit information.",
				action: function () { self.addVisitCriteria(); }
			},
			{
				text: "Add Device Exposure Filters",
				selected: false,
				description: "Find patients based on device exposure.",
				action: function () { self.addDeviceCriteria(); }
			},
			{
				text: "Add Measurement Filters",
				selected: false,
				description: "Find patients based on Measurements.",
				action: function () { self.addMeasurementCriteria(); }
			},
			{
				text: "Add Specimen Filters",
				selected: false,
				description: "Find patients based on Specimen.",
				action: function () { self.addSpecimenCriteria(); }
			},			
			{
				text: "Add Observation Period Filters",
				selected: false,
				description: "Find patients based on Observation Period.",
				action: function () { self.addObservationPeriodCriteria(); }
			},
			{
				text: "Add Death Filters",
				selected: false,
				description: "Find patients based on death.",
				action: function () { self.addDeathCriteria(); }
			},
			{
				text: "Add Filter Group",
				selected: false,
				description: "Add a group to combine Filters.",
				action: function () { self.addAdditionalCriteria(); }
			}
		];

		self.expression = params.expression;
		self.group = params.group;
		self.parentGroup = params.parentGroup;
		self.options = options;
		self.groupCountOptions = ko.pureComputed(function() {
			var optionsArray = ['0'];
			for (var i=0;i < (self.group().CriteriaList().length + self.group().Groups().length); i++) {
				optionsArray.push(""+(i+1));
			}
			return optionsArray;
		});

		self.getCriteriaComponent = function (data) {

			if (data.hasOwnProperty("Person"))
				return "person-criteria";
			else if (data.hasOwnProperty("ConditionOccurrence"))
				return "condition-occurrence-criteria";
			else if (data.hasOwnProperty("ConditionEra"))
				return "condition-era-criteria";
			else if (data.hasOwnProperty("DrugExposure"))
				return "drug-exposure-criteria";
			else if (data.hasOwnProperty("DrugEra"))
				return "drug-era-criteria";
			else if (data.hasOwnProperty("DoseEra"))
				return "dose-era-criteria";
			else if (data.hasOwnProperty("ProcedureOccurrence"))
				return "procedure-occurrence-criteria";
			else if (data.hasOwnProperty("VisitOccurrence"))
				return "visit-occurrence-criteria";
			else if (data.hasOwnProperty("Observation"))
				return "observation-criteria";
			else if (data.hasOwnProperty("DeviceExposure"))
				return "device-exposure-criteria";
			else if (data.hasOwnProperty("Measurement"))
				return "measurement-criteria";
			else if (data.hasOwnProperty("Specimen"))
				return "specimen-criteria";
			else if (data.hasOwnProperty("ObservationPeriod"))
				return "observation-period-criteria";			
			else if (data.hasOwnProperty("Death"))
				return "death-criteria";
			else
				return "unknown-criteria";
		};

		self.addAdditionalCriteria = function () {
			self.group().Groups.push(new CriteriaGroup(null, unwrappedExpression.ConceptSets));
		};

		self.addConditionCriteria = function () {
			var unwrappedExpression = ko.utils.unwrapObservable(self.expression);
			self.group().CriteriaList.push(new AdditionalCriteria({
				Criteria: {
					ConditionOccurrence: {}
				}
			}, unwrappedExpression.ConceptSets));
		};

		self.addConditionEraCriteria = function () {
			var unwrappedExpression = ko.utils.unwrapObservable(self.expression);
			self.group().CriteriaList.push(new AdditionalCriteria({
				Criteria: {
					ConditionEra: {}
				}
			}, unwrappedExpression.ConceptSets));
		};

		self.addDrugExposureCriteria = function () {
			var unwrappedExpression = ko.utils.unwrapObservable(self.expression);
			self.group().CriteriaList.push(new AdditionalCriteria({
				Criteria: {
					DrugExposure: {}
				}
			}, unwrappedExpression.ConceptSets));
		};

		self.addDrugEraCriteria = function () {
			var unwrappedExpression = ko.utils.unwrapObservable(self.expression);
			self.group().CriteriaList.push(new AdditionalCriteria({
				Criteria: {
					DrugEra: {}
				}
			}, unwrappedExpression.ConceptSets));
		};

		self.addDoseEraCriteria = function () {
			var unwrappedExpression = ko.utils.unwrapObservable(self.expression);
			self.group().CriteriaList.push(new AdditionalCriteria({
				Criteria: {
					DoseEra: {}
				}
			}, unwrappedExpression.ConceptSets));
		};

		self.addProcedureCriteria = function () {
			var unwrappedExpression = ko.utils.unwrapObservable(self.expression);
			self.group().CriteriaList.push(new AdditionalCriteria({
				Criteria: {
					ProcedureOccurrence: {}
				}
			}, unwrappedExpression.ConceptSets));
		};
		
		self.addObservationCriteria = function () {
			var unwrappedExpression = ko.utils.unwrapObservable(self.expression);
			self.group().CriteriaList.push(new AdditionalCriteria({
				Criteria: {
					Observation: {}
				}
			}, unwrappedExpression.ConceptSets));
		};	

		self.addVisitCriteria = function () {
			var unwrappedExpression = ko.utils.unwrapObservable(self.expression);
			self.group().CriteriaList.push(new AdditionalCriteria({
				Criteria: {
					VisitOccurrence: {}
				}
			}, unwrappedExpression.ConceptSets));
		};
		
		self.addDeviceCriteria = function () {
			var unwrappedExpression = ko.utils.unwrapObservable(self.expression);
			self.group().CriteriaList.push(new AdditionalCriteria({
				Criteria: {
					DeviceExposure: {}
				}
			}, unwrappedExpression.ConceptSets));
		};
		
		self.addMeasurementCriteria = function () {
			var unwrappedExpression = ko.utils.unwrapObservable(self.expression);
			self.group().CriteriaList.push(new AdditionalCriteria({
				Criteria: {
					Measurement: {}
				}
			}, unwrappedExpression.ConceptSets));
		};

		self.addSpecimenCriteria = function () {
			var unwrappedExpression = ko.utils.unwrapObservable(self.expression);
			self.group().CriteriaList.push(new AdditionalCriteria({
				Criteria: {
					Specimen: {}
				}
			}, unwrappedExpression.ConceptSets));
		};
		
		self.addObservationPeriodCriteria = function () {
			var unwrappedExpression = ko.utils.unwrapObservable(self.expression);
			self.group().CriteriaList.push(new AdditionalCriteria({
				Criteria: {
					ObservationPeriod: {}
				}
			}, unwrappedExpression.ConceptSets));
		};		
		
		self.addDeathCriteria = function()
		{
			var unwrappedExpression = ko.utils.unwrapObservable(self.expression);
			self.group().CriteriaList.push(new AdditionalCriteria({
				Criteria: {
					Death: {}
				}
			}, unwrappedExpression.ConceptSets));
		}
		
		self.removeCriteria = function (observableList, data) {
			observableList.remove(data);
		};

		self.addCriteriaSettings = {
			selectText: "Add New Criteria...",
			width:250,
			height:300,
			actionOptions: addCriteriaActions,
			onAction: function (data) {
				data.selectedData.action();
			}
		}
	}

	// return compoonent definition
	return {
		viewModel: CriteriaGroupViewModel,
		template: template
	};
});