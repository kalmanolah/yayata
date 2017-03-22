export const LEAVE_STATUSES = ['PENDING', 'REJECTED', 'APPROVED', 'DRAFT'];
export const LEAVE_TYPES = [];
export const PERFORMANCE_TYPES = [];
export const COMPANIES = [];
export const CONTRACTS = [];
export const MY_TIMESHEETS = [];
export const WEEK_FORMATTING = {
	'Workweek': {
		'start': 1,
		'end': 5
	},
	'Weekend': {
		'start': 6,
		'end': 7
	},
	'Fullweek': {
		'start': 1,
		'end': 7
	}
};

export class LeaveType {
	constructor(id, name) {
		this.id = id;
		this.name = name;
	}

	toString() {
		return this.name;
	}
}
