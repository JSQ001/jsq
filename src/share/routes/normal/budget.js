import BudgetJournal from 'containers/budget/budget-journal/budget-journal'
import NewBudgetJournal from 'containers/budget/budget-journal/new-budget-journal'
import BudgetJournalDetail from 'containers/budget/budget-journal/budget-journal-detail'
import BudgetJournalDetailSubmit from 'containers/budget/budget-journal/budget-journal-detail-submit.js'

import BudgetJournalReCheck from 'containers/budget/budget-journal-re-check/budget-journal-re-check.js'
import BudgetJournalReCheckDetail from 'containers/budget/budget-journal-re-check/budget-journal-re-check-detail.js'


import BudgetBalance from 'containers/budget/budget-balance/budget-balance'
import BudgetBalanceResult from 'containers/budget/budget-balance/budget-balance-result'

//新建预算日记账
const newBudgetJournal={
  key:'new-budget-journal',
  url:'/main/budget/budget-journal/new-budget-journal',
  components:NewBudgetJournal,
  parent: 'budgetJournal',
};

//预算日记账详情
const budgetJournalDetail={
  key:'budget-journal-detail',
  url:'/main/budget/budget-journal/budget-journal-detail/:journalCode',
  components:BudgetJournalDetail,
  parent: 'budgetJournal',
};

//预算日记账详情(已经提交过的)
const budgetJournalDetailSubmit={
  key:'budget-journal-detail-submit',
  url:'/main/budget/budget-journal/budget-journal-detail-submit/:journalCode',
  components:BudgetJournalDetailSubmit,
  parent:'budget-journal-detail-submit'

}

//预算日记账
const budgetJournal = {
  key:'budget-journal',
  url:'/main/budget/budget-journal',
  components: BudgetJournal,
  parent: 'budget',
  children: {newBudgetJournal,budgetJournalDetail,budgetJournalDetailSubmit}
};



//预算日记账复核详情
const budgetJournalReCheckDetail={
  key:'budget-journal-re-check-detail',
  url:'/main/budget/budget-journal-re-check/budget-journal-re-check-detail/:journalCode',
  components:BudgetJournalReCheckDetail,
  parent:'budget-journal-re-check'

}


//预算日记账复核

const budgetJournalReCheck = {
  key:'budget-journal-re-check',
  url:'/main/budget/budget-journal-re-check',
  components: BudgetJournalReCheck,
  parent: 'budget',
  children: {budgetJournalReCheckDetail}
};





const budgetBalanceResult = {
  key: 'budget-balance-result',
  url:'/main/budget/budget-balance/budget-balance-result/:id',
  components: BudgetBalanceResult,
  parent: 'budget-balance'
};


//预算余额
const budgetBalance = {
  key: 'budget-balance',
  url:'/main/budget/budget-balance',
  components: BudgetBalance,
  parent: 'budget',
  children: {
    budgetBalanceResult
  }
};

//预算
const budget = {
  key:'budget',
  subMenu: [budgetJournal, budgetBalance,budgetJournalReCheck],
  icon: 'tags'
};

export default budget