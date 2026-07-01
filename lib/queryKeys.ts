export const queryKeys = {
	user: {
		me: ["user", "me"] as const,
	},
	addresses: {
		list: ["addresses", "list"] as const,
	},
	orders: {
		myOrders: ["orders", "my-orders"] as const,
		restaurantOrders: (restaurantId: string) =>
			["orders", "restaurant-orders", restaurantId] as const,
	},
	restaurant: {
		myRestaurant: ["restaurant", "my-restaurant"] as const,
		categories: (restaurantId: string) =>
			["restaurant", "categories", restaurantId] as const,
		menuItems: (restaurantId: string) =>
			["restaurant", "menu-items", restaurantId] as const,
		customizationGroups: (restaurantId: string, itemId: string) =>
			[
				"restaurant",
				restaurantId,
				"menu-item",
				itemId,
				"customization-groups",
			] as const,
		customizations: (itemId: string) =>
			["restaurant", itemId, "customizations"] as const,
	},
	admin: {
		pendingRestaurants: ["admin", "pending-restaurants"] as const,
		allRestaurants: ["admin", "all-restaurants"] as const,
		pendingDrivers: ["admin", "pending-drivers"] as const,
		users: ["admin", "users"] as const,
	},
	driver: {
		profile: ["driver", "profile"] as const,
		pendingRequest: ["driver", "pending-request"] as const,
	},
};
