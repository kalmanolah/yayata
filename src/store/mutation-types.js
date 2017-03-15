export const OAUTH2_CONFIGURE = 'OAUTH2/CONFIGURE';
export const OAUTH2_SET_TOKEN = 'OAUTH2/SET_TOKEN';
export const OAUTH2_GET_TOKEN = 'OAUTH2/GET_TOKEN';
export const OAUTH2_REFRESH_TOKEN = 'OAUTH2/REFRESH_TOKEN';
export const OAUTH2_SET_AUTHENTICATED = 'OAUTH2/SET_AUTHENTICATED';

export const NINETOFIVER_API_REQUEST = 'NINETOFIVER/API_REQUEST';
export const NINETOFIVER_RELOAD_USER = 'NINETOFIVER/RELOAD_USER';
export const NINETOFIVER_SET_USER = 'NINETOFIVER/SET_USER';

export const LEAVE_STATUSES = ['PENDING', 'REJECTED', 'APPROVED', 'DRAFT'];
export const LEAVE_TYPES = [];
export const COMPANIES = [];
export const CONTRACTS = [];

export class LeaveType {
	constructor(id, label) {
		this.id = id;
		this.label = label;
	}

	toString() {
		return this.label;
	}
}
