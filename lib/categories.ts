export const categoryObject: { [category: string]: { name: string, subCategories: string[] }} = {
  "Housing": {
    "name": "Housing",
    "subCategories": [
      "Mortgage or rent",
      "Property taxes",
      "Home insurance",
      "Maintenance and repairs"
    ]
  },
  "Utilities": {
    "name": "Utilities",
    "subCategories": [
      "Electricity",
      "Gas",
      "Water",
      "Internet",
      "Cable or satellite TV",
      "Phone bills"
    ]
  },
  "Transportation": {
    "name": "Transportation",
    "subCategories": [
      "Car payment",
      "Gasoline",
      "Maintenance and repairs",
      "Insurance",
      "Public transportation"
    ]
  },
  "Groceries": {
    "name": "Groceries",
    "subCategories": [
      "Food and beverages",
      "Toiletries and household items"
    ]
  },
  "Health": {
    "name": "Health",
    "subCategories": [
      "Health insurance premiums",
      "Prescription medications",
      "Doctor visits",
      "Dental care",
      "Vision care"
    ]
  },
  "Insurance": {
    "name": "Insurance",
    "subCategories": [
      "Life insurance",
      "Disability insurance",
      "Long-term care insurance"
    ]
  },
  "Debt Payments": {
    "name": "Debt Payments",
    "subCategories": [
      "Credit card payments",
      "Student loan payments",
      "Personal loan payments"
    ]
  },
  "Savings": {
    "name": "Savings",
    "subCategories": [
      "Emergency fund",
      "Retirement savings",
      "Other savings goals (e.g., vacation fund, education fund)"
    ]
  },
  "Entertainment": {
    "name": "Entertainment",
    "subCategories": [
      "Dining out",
      "Movies and shows",
      "Hobbies and recreation",
      "Subscriptions (e.g., streaming services, magazines)"
    ]
  },
  "Personal Care": {
    "name": "Personal Care",
    "subCategories": [
      "Haircuts",
      "Beauty products",
      "Gym or fitness memberships"
    ]
  },
  "Clothing": {
    "name": "Clothing",
    "subCategories": [
      "Clothing purchases",
      "Dry cleaning and laundry"
    ]
  },
  "Education": {
    "name": "Education",
    "subCategories": [
      "Tuition fees",
      "Books and supplies",
      "Educational subscriptions or courses"
    ]
  },
  "Childcare/Children": {
    "name": "Childcare/Children",
    "subCategories": [
      "Daycare or babysitting",
      "School expenses",
      "Extracurricular activities"
    ]
  },
  "Gifts and Celebrations": {
    "name": "Gifts and Celebrations",
    "subCategories": [
      "Birthday gifts",
      "Holiday gifts",
      "Wedding gifts",
      "Celebration expenses"
    ]
  },
  "Miscellaneous": {
    "name": "Miscellaneous",
    "subCategories": [
      "Pet care",
      "Charitable donations",
      "Bank fees",
      "Miscellaneous expenses"
    ]
  }
};

export const categories = Object.values(categoryObject).map((category) => category.name);
