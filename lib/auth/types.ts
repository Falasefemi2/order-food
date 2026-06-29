export type RegisterParams = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	phoneNumber?: string;
	role?: "customer" | "driver" | "vendor";
};

export type LoginParams = {
	email: string;
	password: string;
};
