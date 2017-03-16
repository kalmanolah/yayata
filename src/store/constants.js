export const LEAVE_STATUSES = ['PENDING', 'REJECTED', 'APPROVED', 'DRAFT'];
export const LEAVE_TYPES = [];
export const COMPANIES = [];
export const CONTRACTS = [];

export class LeaveType {
	constructor(id, name) {
		this.id = id;
		this.name = name;
	}

	toString() {
		return this.name;
	}
}
