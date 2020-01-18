db.users.drop();
db.users.insertMany([
  {
    _id: ObjectId('5dae58764330512bdc80776f'),
    name: 'Macho man',
    email: 'randy@savage.com',
    // password is RandySavage
    password: '$2y$10$dv2.YEaDEhdMzyR0MtECX.r5tsg4d6siC28YkI2ixmgJA0hlGD11G'
  },
  {
    _id: ObjectId('5dae58764552512bdc80776f'),
    name: 'Rich man',
    email: 'meddy@richman.com',
    // Password is RichmanMeddy
    password: '$2y$10$27ajUyYCgpBYUZFVNTTMsuwdgVr7u/PRr55wt13H/pd2HbgLld8Le'
  }
]);

db.refreshTokens.drop();
db.refreshTokens.insertMany([
  {
    token:
      'hEtvPjVk2xEE2Q5ODGBfZSfEzaAUABEaZ4jTk6RkKJhgk3wefAa3L66soMlvXkovuPivNWrAEClpeqIQXuBb0abLbc04NyZST5M2HDZSYTFxir0BRVuLkQtkWY4kIDdv',
    userId: '5dae58764330512bdc80776f',
    email: 'randy@savage.com',
    isRevoked: false
  }
]);

db.budgetPeriods.drop();
db.budgetPeriods.insertMany([
  {
    _id: ObjectId('5dae27664330215bdc80776f'),
    userId: '5dae58764330512bdc80776f',
    status: 'inactive',
    date: 1262300400
  },
  {
    _id: ObjectId('5dae27664330215bdc80777f'),
    userId: '5dae58764330512bdc80776f',
    status: 'active',
    date: 1264978800
  },
  {
    _id: ObjectId('5dae27664330215bdc80778f'),
    userId: '5dae58764552512bdc80776f',
    isActive: 'pending',
    date: 1267657200
  }
]);

db.categories.drop();
db.categories.insertMany([
  {
    _id: ObjectId('5dae28753220215bdc80776f'),
    name: 'Travel and tourism'
  },
  {
    _id: ObjectId('5dae24963120772bdc80793e'),
    name: 'Food and drinks'
  }
]);

db.budgetedCategories.drop();
db.budgetedCategories.insertMany([
  {
    _id: ObjectId('5dea27853202215bdc80767f'),
    userId: '5dae58764330512bdc80776f',
    budgetPeriodId: '5dae27664330215bdc80776f',
    categoryName: 'Travel and tourism',
    amount: 1240
  },
  {
    _id: ObjectId('5e1fa8397ffd0d6390f50679'),
    userId: '5dae58764330512bdc80776f',
    budgetPeriodId: '5dae27664330215bdc80776f',
    categoryName: 'Food and drinks',
    amount: 980
  }
]);

db.expenses.drop();
db.expenses.insertMany([
  {
    _id: ObjectId('5e1fa8397ffd0d6390f50679'),
    userId: '5dae58764330512bdc80776f',
    budgetPeriodId: '5dae27664330215bdc80776f',
    budgetedCategoryId: '5dea27853202215bdc80767f',
    name: 'Venezuela',
    amount: 550
  }
]);

db.earnings.drop();
db.earnings.insertMany([
  {
    _id: ObjectId('5e1fa8397ffd0d6390f50679'),
    userId: '5dae58764330512bdc80776f',
    budgetPeriodId: '5dae27664330215bdc80776f',
    budgetedCategoryId: '5dea27853202215bdc80767f',
    name: 'Venezuela refund',
    amount: 550
  }
]);
