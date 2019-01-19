// MODEL
var budgetController = (function(){
  // Empty Data Structure
  var data = {
    income: {
      id: [],
      desc: [],
      val: [],
      total: 0,
    },
    expense: {
      id:[],
      desc: [],
      val: [],
      perc: [],
      total: 0,
      totalPerc: 0
    },
    budget: 0
  }  
  
    
  
  
  
  // All calculation functions
  // Calculate totals function
  function calcTotal(type){
    type.total = 0
    for (let i = 0; i < type.val.length; i++) {
      type.total += type.val[i]
    }
    data.budget = data.income.total - data.expense.total
  }
  
  
  
  // Calculates a value as a % of total income (just integer)
  function calcPerc(val){
    var perc = Math.round((val / data.income.total) * 100)
    return perc
  }
    
  
  // Finds the current month
  function currentMonth(){
    var today = new Date()
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]
    return months[today.getMonth()]
  }
  
  
  
  // Adds description, value, and totals to data
  function addData(type, desc, value, id){
    type.desc.push(desc)
    type.val.push(parseFloat(value))
    type.id.push(id)
    calcTotal(type)
  }
  
  // Adds percentage and total percentage data to expenses
  function updatePercData(){
    var vals = data.expense      
    if (vals.total > 0 && data.income.total > 0) {
      vals.totalPerc = calcPerc(vals.total)
      for (var i = 0; i < vals.val.length; i++) {
        vals.perc[i] = calcPerc(vals.val[i])
      }
    } else {
      vals.totalPerc = 0
      for (var i = 0; i < vals.val.length; i++) {
        vals.perc[i] = 0
      }    
    }
  }
  
  
  // Removes a complete set of data from data
  function removeData(type, id){
    for (var i = 0; i < type.id.length; i++) {
      if (type.id[i] === id){
        type.desc.splice(i,1)
        type.val.splice(i,1)
        type.id.splice(i,1)
        if (type === data.expense){
          type.perc.splice(i,1)
        }
      }
    }
    calcTotal(type)
  }
  
  
  
  
  // Return Data
  return {
    data,         // I.e. data: data,
    calcPerc,
    currentMonth,
    addData,
    updatePercData,
    removeData
  }
})()

















// view
var uiController = (function(){
  // Define DOM elements
  var domEls = {
    addType: document.querySelector('.add__type'),
    addDesc: document.querySelector('.add__description'),
    addValue: document.querySelector('.add__value'),
    addBtn: document.querySelector('.add__btn'),
    incomeList: document.querySelector('.income__list'),
    expenseList: document.querySelector('.expenses__list'),
    totInc: document.querySelector('.budget__income--value'),
    totExp: document.querySelector('.budget__expenses--value'),
    totPer: document.querySelector('.budget__expenses--percentage'),
    month: document.querySelector('.budget__title--month'),
    budget: document.querySelector('.budget__value'),
    addCont: document.querySelector('.add__container'),
    container: document.querySelector('.container')
  }
  var data = budgetController.data
  
  
  
  
  // Display starting values, including month
  function initValues(month, budget, income, expense, percent){
    domEls.month.innerText = month
    domEls.budget.innerText = budget
    domEls.totInc.innerHTML = income
    domEls.totExp.innerText = expense
    domEls.totPer.innerText = percent
    
  }



  // Add UI Item
  function addUIItem(type, desc, value, id){
    var newIncItem = 
    `<div class="item clearfix"  id="income-${id}">
      <div class="item__description">${desc}</div>
      <div class="right clearfix">
        <div class="item__value">+ ${addDecimals(value)}</div>
        <div class="item__delete">
          <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
        </div>
      </div>
    </div>`
    
    var newExpItem = 
    `<div class="item clearfix"  id="expense-${id}">
      <div class="item__description">${desc}</div>
      <div class="right clearfix">
        <div class="item__value">- ${addDecimals(value)}</div>
        <div class="item__percentage">---</div>
        <div class="item__delete">
          <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
        </div>
      </div>
    </div>`
      
    
    if (type === data.income) {
      domEls.incomeList.insertAdjacentHTML('beforeend', newIncItem)
    } else if (type === data.expense) {
      domEls.expenseList.insertAdjacentHTML('beforeend', newExpItem)
    }
  }  
  
  // Remove UI item
  function removeUIItem(type, id){
    var item = document.getElementById(`${type}-${id}`)
    console.log(item);
    item.parentNode.removeChild(document.getElementById(`${type}-${id}`))
    
    // <div class="item__delete">
    //       <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
    //     </div>
  }  
  
  
  // Clear inputs
  function clear(){
    domEls.addDesc.value = ""
    domEls.addValue.value = ""
  }
  
  
  
  
  // Take a number or a string in the form of a number, and returns a string with 2 d.p.
  // Works for negative numbers too
  function addDecimals(val){
    var arr, appnd 
    arr = String(val).split('.')
    if (arr[1]) { // If there are any decimals
      if (arr[1].length === 1) { // If 1 decimal
        appnd = "." + arr[1] + "0"
      } else if (arr[1].length > 2) { // If +2 decimals
        var dec = arr[1].slice(0,3)
        var newNum = Math.round(
          Number(
            dec.slice(0,2) + "." + dec.slice(2,3)
          )
        )
        appnd = "." + newNum
      } else { // If 2 decimals present
        appnd = "." + arr[1]
      }
    } else { // If there are not any decimals
      appnd = ".00"
      // ADD .00 TO END
    }
    return Number(arr[0]).toLocaleString() + appnd
  }
  
  
  
  // Update total income, expense, budget
  function updateUITotals(incVal, expVal){
    var sign
    var budget = addDecimals(data.budget)
    if (data.budget >= 0) {
      sign = "+ "
    } else {
      sign = "- "
      budget = budget.slice(1)
    }
    domEls.budget.innerText = sign + budget
    domEls.totInc.innerText = "+ " + addDecimals(incVal)
    domEls.totExp.innerText = "- " + addDecimals(expVal)
  }  
  
  
  
  // Update total percentages
  function updateTotalPercentage(percentage){
    domEls.totPer.innerText = percentage + "%"
  }
  
  // Update individual item percentages
  function updateItemPercentages(id,i){
    // console.log(id,i)
    var item = document.getElementById(`expense-${id}`).querySelector('.item__percentage')
    if (data.income.total > 0) {
      item.innerText = `${data.expense.perc[i]}%` 
    } else {
      item.innerText = `---` 
    }
  }
  
  
  
  function changeColor(){
    domEls.addType.classList.toggle("exp")
    domEls.addDesc.classList.toggle("exp")
    domEls.addValue.classList.toggle("exp")
    domEls.addBtn.classList.toggle("exp")
  }
  
  
  

  
  
  return {
    domEls,
    initValues,
    addUIItem,
    removeUIItem,
    clear,
    addDecimals,
    updateUITotals,
    updateTotalPercentage,
    updateItemPercentages,    
    changeColor
  }
})()
















// CONTROLLER
var controller = (function(model, view){
  // Import from M & V
  var DOM = uiController.domEls
  var data = model.data
  var inputType = DOM.addType
  var inputDesc = DOM.addDesc
  var inputVal = DOM.addValue
  var income = data.income
  var expense = data.expense
  
  // Set up event listeners
  var setupEventListeners = function(){
    
    // Test to check if both cells are valid and submits
    DOM.addBtn.addEventListener('click', acceptInput)

    // Submits form on enter key
    DOM.addCont.addEventListener('keypress', function(){
      if (event.key === "Enter") {
        acceptInput()
      }
    })
    
    // Listens for bad keys
    inputVal.addEventListener('keypress', restrictKeys)
    
    // Chanes on focus border color
    DOM.addType.addEventListener('change', view.changeColor)
   
    // Listens for bad keys
    DOM.container.addEventListener('click', function(){
      var a = event.target.parentNode
      if (a.classList.contains("item__delete--btn")) {
        var b = a.parentNode.parentNode.parentNode.id.split('-')
        console.log(b);
        removeItem(...b)
      }
    })
  }
  
  
  // Controller Functions
  // Control input in forms
  function restrictKeys(){
    var val = inputVal
    if (event.key === 'e' || event.key === 'E'){
      event.preventDefault()
    } else if(val.value.includes('.') && event.key === '.'){
      event.preventDefault()
    } else if(val.value.startsWith('.',val.value.length-3)){
      event.preventDefault()
    }
  }
  
  // checks for income or expense
  function checkInputType(){
    var type
    if (inputType.value === "income") {
      return type = income
    } else if (inputType.value === "expense") {
      return type = expense
    }
  }
  
  // checks for income or expense
  // function checkRemoveTyp(type){
  // 
  // }
  
  
  // Update Percentages (total and individual)
  function updateUIPerc() {
    if (income.total > 0 && expense.total > 0) {
      view.updateTotalPercentage(model.calcPerc(expense.total))
    } else {
      DOM.totPer.innerText = "---"
    }
    if (expense.total > 0) {
      for (var i = 0; i < expense.val.length; i++) {
        view.updateItemPercentages(expense.id[i],i)
      }
    }
  }
  
  
  

  
  // Push data to M & V for update

    // Add new items
    function addItem(type, desc, val){
      // Assign ID
      var id
      if (type.id[0] === undefined) {
        id = 0
      } else {
        id = (type.id[type.id.length - 1]) + 1
      }

      // Update data
      model.addData(type, desc, val, id)
      model.updatePercData()
      
      // Update UI
      view.addUIItem(type, desc, val, id)
      view.updateUITotals(income.total, expense.total)
      updateUIPerc()
      view.clear()  
    }
    
    
    // Delete items     "income" "0"
    function removeItem(type, id){
      // Arguments correctly:
        // "income" or "expens" & index#(as string)
      if (type === "income") {
        var ty = data.income
      } else if (type === "expense") {
        var ty = data.expense
      }
      
      // Update data
      model.removeData(ty, Number(id))
      model.updatePercData()
      
      // // update UI
      view.removeUIItem(type, id)
      view.updateUITotals(income.total, expense.total)
      updateUIPerc()
      
    }
    
  
  
  function acceptInput(){
    if (DOM.addDesc.value !== "" && DOM.addValue.value !== "" && DOM.addValue.value > 0 ) {
      return addItem(checkInputType(),inputDesc.value, inputVal.value)
    }
  }
  
  
  
  
  
  // Initialisation 
  return {
    init: function(){
      setupEventListeners()
      view.initValues(model.currentMonth(), "+ 0.00", "+ 0.00", "- 0.00", "---")
    },
  }
})(budgetController, uiController)

controller.init()
