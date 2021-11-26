'use strict';

// -----------------------------------------------------------
//--------------------- SomeJsonRequests ---------------------
// -----------------------------------------------------------
class SomeJsonRequests {
  /**
   * Класс для выполнения запросов к серверу и возвращения Promise
   * @returns {Promise<unknown>}
   */

  sendJSONRequest(url, json, method) {
    return new Promise(function (resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          resolve(xhr.response);
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        }
      };
      xhr.onerror = function () {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };
      let data = JSON.stringify(json);
      xhr.send(data);
    });
  }

  sendPostJSONRequest(url, json, method = "POST") {
    return this.sendJSONRequest(url, json, method);
  }

  sendGetJSONRequest(url, json, method = "GET") {
    return this.sendJSONRequest(url, json, method);
  }

  sendDeleteJSONRequest(url, json, method = "DELETE") {
    return this.sendJSONRequest(url, json, method);
  }

}

// -----------------------------------------------------------
//--------------------- ProductListV2 ------------------------
// -----------------------------------------------------------
class ProductListV2 {
  /**
   * Версия вторая
   * Класс служит для:
   *  1. отображения списков и продуктов по спискам
   *  1. назначения и обработки функционала поля ввода новых продуктов
   * @type {SomeJsonRequests}
   */

  addNewListButtonEl = document.querySelector('#addNewListButton');
  productListEl = document.querySelector('#productLists');
  productsEl = document.querySelector('#products');
  checkedProductsEl = document.querySelector('#checkedProducts');
  addProductInputEl = document.querySelector('#addProductInput');
  addProductInputButtonEl = document.querySelector('#addProductInputButton');
  productChoiceEl = document.querySelector('#productChoice');
  // Заготовка для объекта, который будет содержать данные со списками продуктов
  // и прикрепленными к ним продуктами
  receivedListObj = {}
  // Заготовка для объекта, который будет содержать данные с типовым словарем всех продуктов для
  // отображения их в кнопках к полю ввода нового продукта
  receivedProductsDictObj = {}

  init() {
    // Получим список с сервера
    this.getListsWithProducts();

    // Навесим событие на поле добавления новых продуктов
    this.AddEventFocusOnProductInput();
  }

  async someAsyncGetResp(url, json) {
    return await new SomeJsonRequests().sendGetJSONRequest(url, json);
  }

  async someAsyncPostResp(url, json) {
    return await new SomeJsonRequests().sendPostJSONRequest(url, json);
  }

  async someAsyncDeleteResp(url, json) {
    return await new SomeJsonRequests().sendDeleteJSONRequest(url, json);
  }

  mainObjIsEmpty() {
    return Object.keys(this.receivedListObj).length === 0;
  }

//----------- Все, что связано со списками и продуктами в них ----------------
// ---------------------------------------------------------------------------
  getListsWithProducts() {
    /**
     * Получает объект списков с продуктами и передает полученный объект listsObj далее на обработку
     * методу workWithTheReceivedList
     * @type {Promise<any>}
     */


    // ------------ Конструкция асинхронного запроса ----------
    this.someAsyncGetResp(
      document.location.origin + "/api/v1/get_lists_and_products/",
      {}
    ).then(response => {
      response = JSON.parse(response)
      if (response.status === 'success') {

        // Добавим полученный объект в свойство класса
        this.addListObjectToClass(response.listsAndProducts);

        //Начнем отрисовки на основе полученного объекта
        this.workWithTheReceivedList(response.listsAndProducts)

      } else {
        this.errorToConsole(response);
      }
    });
    // ------------------------------------------------------------
  }

  addListObjectToClass(receivedListObj) {
    this.receivedListObj = receivedListObj;
  }


  workWithTheReceivedList() {
    /**
     * Производит с полученным объектом действия добавления событий и отрисовки
     */

    console.log(this.receivedListObj)

    this.setFunctionalForClickCreateNewList();

    if (!this.mainObjIsEmpty()) {
      // Отобразим списки продуктов для пользователя
      this.drawProductLists(this.receivedListObj);

      // Отобразим продукты в первом списке и добавим выделение
      this.drawListProductsAndSetActiveClassForListId(Object.keys(this.receivedListObj)[0])

      //Добавим обработчик события при клике на меню продукта
      this.addEventForClickMenuButtonInProduct();

      //Добавим обработчик события при клике на чекбокс продукта
      this.addEventForCheckAndUncheckProduct();

      // Добавим функционала при клике на списки пользователя
      this.setFunctionalForClickProductsList();

      // Добавим функционала при наведении и уходе на списки пользователя для меню
      this.setFunctionalForMouseoverProductsList();
      this.setFunctionalForMouseoutProductsList();
    } else {
      console.log('Пока нет ни одного списка...');
    }
  }


  setFunctionalForClickCreateNewList() {
    /**
     * Добавляет обработчик события по нажатию на кнопку добавления нового списка
     */
    this.addNewListButtonEl.addEventListener('click', () => {

      // ------------ Конструкция асинхронного запроса ----------
      this.someAsyncPostResp(
        document.location.origin + "/api/v1/add_new_list/",
        {"comment": "giveMeNewList"}
      ).then(response => {
        response = JSON.parse(response)
        if (response.status === 'success') {
          // Добавим в объект и отобразим новый список
          this.receivedListObj[response.listId] = {
            'name': response.listTitle,
            'products': {},
          };
          // Отобразим списки занова
          this.drawProductLists(this.receivedListObj)
          // Отобразим продукты в первом списке и добавим выделение
          this.drawListProductsAndSetActiveClassForListId(response.listId);

        } else {
          this.errorToConsole(response)
        }
      });
      // ------------------------------------------------------------

    });
  }

  getTemplateForProduct(productId, productName, productQuantity) {
    return `<li class="list-group-item" data-id="${productId}">
              <div class="row">
                <div class="col-6 col-lg-4"> 
                <label class="b-contain" id="sameCheckbox" data-id="${productId}">
                  <span class="nowrap" id="sameCheckbox" data-id="${productId}">${productName}</span>
                  <input type="checkbox">
                  <div class="b-input" id="sameCheckbox" data-id="${productId}"></div>
                </label>             
                </div>
                <div class="col-4 col-lg-6 nowrap" style="color: #6f6e6e">
                  ${productQuantity}
                </div>
                <div class="col-2 col-lg-2">
                  <div class="all-menu-area-products">
                    <span class="d-none" id="productMenuFunctionalButtons" data-id="${productId}">
<!--                        <i class="fas fa-pencil-alt color-blue menu-area-products ml-10"></i>-->
                        <i class="far fa-trash-alt color-red menu-area-products ml-10 mr-10" id="productsCheckboxActionDelete" data-id="${productId}"></i>
                    </span>
                      <i class="fas fa-ellipsis-v float-end menu-area-products color-grey" id="productsCheckboxMenu" data-id="${productId}"></i>
                  </div>
                </div>
              </div>
            </li>`
  }

  getCheckedTemplateForProduct(productId, productName, productQuantity) {
    return `<li class="list-group-item checked-background" data-id="${productId}">
                        <div class="row">
                            <div class="col-6 col-lg-4">
                                <label class="b-contain" id="sameCheckbox" data-id="${productId}">
                                    <span class="nowrap" id="sameCheckbox" data-id="${productId}">${productName}</span>
                                    <input type="checkbox" checked>
                                    <div class="b-input" id="sameCheckbox" data-id="${productId}"></div>
                                </label>
                            </div>
                            <div class="col-4 col-lg-6 nowrap" style="color: #6f6e6e">
                                ${productQuantity}
                            </div>
                            <div class="col-2 col-lg-2">
                              <div class="all-menu-area-products">
                                <span class="d-none" id="productMenuFunctionalButtons" data-id="${productId}">
            <!--                        <i class="fas fa-pencil-alt color-blue menu-area-products ml-10"></i>-->
                                    <i class="far fa-trash-alt color-red menu-area-products ml-10 mr-10" id="productsCheckboxActionDelete" data-id="${productId}"></i>
                                </span>
                                  <i class="fas fa-ellipsis-v float-end menu-area-products color-grey" id="productsCheckboxMenu" data-id="${productId}"></i>
                              </div>
                            </div>
                        </div>
                    </li>`
  }

  drawOneProductToEndListAndAddToObject(listId, productId, productName, productQuantity) {
    let str = ``;
    str += this.getTemplateForProduct(productId, productName, productQuantity);
    this.productsEl.insertAdjacentHTML('beforeend', str);
    this.addProductToObjectInClass(listId, productId, productName, productQuantity);
  }

  addProductToObjectInClass(listId, productId, productName, productQuantity) {
    /**
     * Добавит продукт в объект списков класса ProductListV2 по переданным аргументам
     */
    this.receivedListObj[listId]['products'][productId] = [productName, productQuantity];
  }

  clearProductLists() {
    /**
     * Уберет все списки с экрана
     */
    this.productListEl.innerHTML = "";
  }

  drawProductLists(lists) {
    this.clearProductLists();
    let str = ``;
    Object.keys(lists).forEach((id) => {

      str += `
                <a class="list-group-item list-group-item-action mb-2" data-id="${id}">
                    
                    <small class="menu-area d-none float-end" id="listButtonsMenu" data-id="${id}">
                          <i class="fas fa-ellipsis-v fas-line p-e-none"></i>
                    </small>
                    <div class="d-flex w-75 justify-content-between p-e-none">
                      <h6 class="mb-1 p-e-none" id="listTitle:${id}">${lists[id]['name']}</h6>
                      <input type="text" class="form-control p-e-yes d-none list-title-input" value="${lists[id]['name']}" id="renameListArea:${id}" data-id="${id}">
                    </div>
                    <span class="float-start d-none" id="listButtonsAction" data-id="${id}">
                        <i class="fas fa-pencil-alt fa-lg m-2 color-blue p-for-icons" id="listButtonsActionEdit" data-id="${id}"></i>
                        <i class="far fa-trash-alt fa-lg m-2 color-red p-for-icons" id="listButtonsActionDelete" data-id="${id}"></i>
                    </span>
               </a>`;
    });
    // Вставим строки с названиями списков
    this.productListEl.insertAdjacentHTML('beforeend', str);
  }

  drawListProductsAndSetActiveClassForListId(listId) {
    /**
     * Отобразит продукты в первом списке и добавит выделение для первого списка
     */
    this.drawProductsForListId(listId);
    this.addActiveClassForList(listId);
  }

  addEventForCheckAndUncheckProduct() {
    /**
     * Добавляет событие по выбору продукта в списке продуктов
     */
    let productsEl = document.querySelector('#products');
    let checkedProductsEl = document.querySelector('#checkedProducts');

    // События для productsEl
    productsEl.addEventListener('click', ({target}) => {
      // Если кликаем чекбоксу
      if (target.id === 'sameCheckbox') {
        let targetCheckboxId = target.dataset.id;
        console.log(target, targetCheckboxId)
        this.checkProductAsyncRequest(targetCheckboxId);
      }
    });

    // События для checkedProductsEl
    checkedProductsEl.addEventListener('click', ({target}) => {
      // Если кликаем чекбоксу
      if (target.id === 'sameCheckbox') {
        let targetCheckboxId = target.dataset.id;
        console.log(target, targetCheckboxId)
        this.checkProductAsyncRequest(targetCheckboxId);
      }
    });
  }

  checkProductAsyncRequest(targetCheckboxId) {
    /**
     * Отправить асинхронный запрос на сервер для изменения состояния выбора продукта
     */
    // ------------ Конструкция асинхронного запроса ----------
    this.someAsyncPostResp(
      document.location.origin + "/api/v1/toggle_check_for_product/",
      {"productInListId": targetCheckboxId}
    ).then(response => {
      response = JSON.parse(response)
      if (response.status === 'success') {
        console.log(response)
        // Изменим информацию по продукту в объекте
        this.receivedListObj[response.idListWhereCheckWas]
          .products[response.checkProductInListId][2] = response.checkStatus;
        // Отобразим состояние чекбокса и поместим в соответствующий список выбора
        this.drawListProductsAndSetActiveClassForListId(response.idListWhereCheckWas);
      } else {
        this.errorToConsole(response);
      }
    });
    // ------------------------------------------------------------
  }

  addEventForClickMenuButtonInProduct() {
    /**
     * Добавит события на клик по кнопке меню у конкретного продукта
     */
    let productsEl = document.querySelector('#products');
    productsEl.addEventListener('click', ({target}) => {

      // Если кликаем по кнопке меню
      if (target.id === 'productsCheckboxMenu') {
        let targetProductMenuId = target.dataset.id;
        let productMenuFunctionalButtonsEls = document.querySelectorAll('#productMenuFunctionalButtons');
        productMenuFunctionalButtonsEls.forEach(el => {
          if (targetProductMenuId === el.dataset.id) {
            el.classList.toggle('d-none');
          }
        });
      }

      // Если кликаем по кнопке действия удаления
      // <i class="fas fa-spinner menu-area-products fa-spin"></i>
      if (target.id === 'productsCheckboxActionDelete') {
        let targetDeleteIconId = target.dataset.id;

        target.classList.remove("far", "fa-trash-alt", "color-red")
        target.classList.add("fas", "fa-spinner", "color-grey", "fa-spin")

        // ------------ Конструкция асинхронного запроса ----------
        this.someAsyncDeleteResp(
          document.location.origin + "/api/v1/delete_product_for_id/",
          {"productInListId": targetDeleteIconId}
        ).then(response => {
          response = JSON.parse(response)
          if (response.status === 'success') {
            // Удалим в объекте данный продукт
            delete this.receivedListObj[response.idListWhereDeletionWas].products[response.deletedProductInListId]

            // Отобразим продукты в первом списке и добавим выделение
            this.drawListProductsAndSetActiveClassForListId(response.idListWhereDeletionWas);
          } else {
            this.errorToConsole(response);
          }
        });
        // ------------------------------------------------------------
      }

    });
  }

  drawProductsForListId(listId) {
    this.clearProductsFromLabels();

    let str_not_checked_product = ``;
    let str_checked_product = ``;
    let odj = this.receivedListObj[listId]['products'];
    Object.keys(odj).forEach(product_id => {
      if (!odj[product_id][2]) {
        str_not_checked_product += this.getTemplateForProduct(product_id, odj[product_id][0], odj[product_id][1]);
      } else {
        str_checked_product += this.getCheckedTemplateForProduct(product_id, odj[product_id][0], odj[product_id][1]);
      }
    });
    // Вставим строки с названиями продуктов
    this.productsEl.insertAdjacentHTML('beforeend', str_not_checked_product);
    this.checkedProductsEl.insertAdjacentHTML('beforeend', str_checked_product);
  }


  addActiveClassForList(listId) {
    listId = listId.toString();
    this.productListEl.querySelectorAll('a').forEach(el => {
      if (el.dataset.id === listId) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  setFunctionalForMouseoverProductsList() {
    this.productListEl.addEventListener('mouseover', ({target}) => {
      if (
        target.tagName === "A" ||
        target.id === "listButtonsMenu" ||
        target.id === "listButtonsAction" ||
        target.id === "listButtonsActionEdit" ||
        target.id === "listButtonsActionDelete"
      ) {
        let listButtonId = target.dataset.id;
        let listButtonsMenuEls = document.querySelectorAll('#listButtonsMenu');
        listButtonsMenuEls.forEach(el => {
          if (listButtonId === el.dataset.id) {
            el.classList.remove('d-none');
          }
        });
      }
    })
  }

  setFunctionalForMouseoutProductsList() {
    this.productListEl.addEventListener('mouseout', ({target}) => {

      if (target.tagName === "A") {
        let listButtonId = target.dataset.id;
        let listButtonsMenuEls = document.querySelectorAll('#listButtonsMenu');
        listButtonsMenuEls.forEach(el => {
          if (listButtonId === el.dataset.id) {
            el.classList.add('d-none');
          }
        });
      }
    });
  }

  setFunctionalForClickProductsList() {
    this.productListEl.addEventListener('click', ({target}) => {
      // Если кликаем просто по списку
      if (target.tagName === "A") {
        this.drawListProductsAndSetActiveClassForListId(target.dataset.id);
      }

      // Если кликаем по кнопке меню
      if (target.id === 'listButtonsMenu') {
        let targetMenuId = target.dataset.id;
        let listButtonsActionEls = document.querySelectorAll('#listButtonsAction');

        listButtonsActionEls.forEach(el => {
          if (targetMenuId === el.dataset.id) {
            el.classList.toggle('d-none')
          }

        });
      }

      // Если кликаем по кнопке действия редактирования
      if (target.id === 'listButtonsActionEdit') {
        let targetEditIconId = target.dataset.id;
        let listTitleEl = document.querySelector("#listTitle\\:" + targetEditIconId);
        let renameListAreaEl = document.querySelector("#renameListArea\\:" + targetEditIconId);
        let titleText = listTitleEl.innerText

        listTitleEl.classList.toggle('d-none');
        renameListAreaEl.classList.toggle('d-none');
        renameListAreaEl.focus();
        renameListAreaEl.select();
        renameListAreaEl.defaultValue = titleText;

        this.setFunctionalEnterInRenameListField(renameListAreaEl, listTitleEl);

      }

      // Если кликаем по кнопке действия удаления
      if (target.id === 'listButtonsActionDelete') {
        let targetDeleteIconId = target.dataset.id;

        // ------------ Конструкция асинхронного запроса ----------
        this.someAsyncDeleteResp(
          document.location.origin + "/api/v1/delete_list_for_id/",
          {"listId": targetDeleteIconId}
        ).then(response => {
          response = JSON.parse(response)
          if (response.status === 'success') {
            // Удалим в объект и уберем удаленный список
            delete this.receivedListObj[response.deletedListId]

            // Отобразим списки заново
            this.drawProductLists(this.receivedListObj)
            // Отобразим продукты в первом списке и добавим выделение
            this.drawListProductsAndSetActiveClassForListId(Object.keys(this.receivedListObj)[0]);
          } else {
            this.errorToConsole(response);
          }
        });
        // ------------------------------------------------------------
      }

    });
  }

  setFunctionalEnterInRenameListField(renameListAreaEl, listTitleEl) {
    /**
     * Добавляет обработчик события по нажатию enter в поле редактирования имя списка
     */
    renameListAreaEl.addEventListener('keypress', (event) => {

      if (event.code === 'Enter' || event.code === 'NumpadEnter') {

        // ------------ Конструкция асинхронного запроса ----------
        this.someAsyncPostResp(
          document.location.origin + "/api/v1/set_list_new_name/",
          {"listId": renameListAreaEl.dataset.id, "listNewName": renameListAreaEl.value}
        ).then(response => {
          response = JSON.parse(response)
          if (response.status === 'success') {
            listTitleEl.innerText = renameListAreaEl.value;
            listTitleEl.classList.remove('d-none');
            renameListAreaEl.classList.add('d-none');
          } else {
            this.errorToConsole(response);
          }
        });
        // ------------------------------------------------------------
      }
    });
  }


  errorToConsole(response) {
    console.log(`Пришел ответ со статусом ${response.status}, status.code ${response.code}`)
  }

  clearProductsFromLabels() {
    this.productsEl.innerHTML = '';
    this.checkedProductsEl.innerHTML = '';
  }


  //----------- Все, что связано с полем ввода новых продуктов -----------------
  // ---------------------------------------------------------------------------
  AddEventFocusOnProductInput() {
    /**
     * Добавляет событие на выбор поля для ввода нового продукта в список
     */


    // Событие на фокусировку поля
    this.addProductInputEl.addEventListener('focus', ({target}) => {

      console.log('addEventListener_focus');

      //Добавим тень на заднем фоне
      this.setBackgroundShadow(true);

      //Поменяем надпись внутри данного input
      console.dir(this.addProductInputEl);
      this.addProductInputEl.placeholder = "Название : количество";

      // Вернем объект с продуктами,а когда придет информация от сервера,
      // то заберем продукты в объект allProducts вида {productId: productName}

      // ------------ Конструкция асинхронного запроса ----------
      this.someAsyncGetResp(
        document.location.origin + "/api/v1/get_products_dict/",
        {}
      ).then(response => {
        response = JSON.parse(response)
        if (response.status === 'success') {
          this.receivedProductsDictObj = response.productsDict;
        } else {
          this.errorToConsole(response);
        }
      });
      // ------------------------------------------------------------

    });


    // Событие клика по кнопкам продукта productChoiceEl
    this.setEventForClickNewProductField();

    //Событие по изменению ввода в поле новых продуктов
    this.setEventForInputNewProductField();

    //Событие по нажатию enter внутри поля ввода новых продуктов
    this.setEventForPressEnterForInputNewProductField();

    // Добавим обработчик события при клике на кнопку добавления нового продукта
    this.setEventForClickNewProductButton();

    // Событие расфокусировки с поля addProductInputEl
    this.setEventForOutingFromNewProductInput();


  }

  setEventForInputNewProductField() {
    /**
     * Добавляет и обрабатывает по изменению ввода в поле новых продуктов
     */
    this.addProductInputEl.addEventListener('input', ({target}) => {
      this.clearProductButtonsFromWindow();

      // Если есть хоть один символ в поле нового продукта
      if (target.value.length > 0) {
        // Найдем подстроку в названиях продуктов в объекте словаря типовых продуктов и вернем только
        // те свойства, в которых встречается переданная подстрока
        const filteredObj = this.getDictOfProductsForSubstring(target.value);
        this.renderAdditionProductButtons(filteredObj);
        //Сделаем кнопку добавления нового продукта активной
        this.setModButtonForAddNewProduct('able');

      } else {
        this.setModButtonForAddNewProduct('disable');
      }

    });
  }

  setEventForPressEnterForInputNewProductField() {
    /**
     * Добавляет событие по нажатию enter внутри поля ввода новых продуктов
     */
    this.addProductInputEl.addEventListener('keypress', (event) => {
      if (event.code === 'Enter' || event.code === 'NumpadEnter') {
        if (this.addProductInputEl.value.length > 1) {
          this.sendJSONNewProductToServer(this.getListId(), null, this.addProductInputEl.value);

          //Очистим поле ввода нового продукта
          this.clearNewProductInputValue();

          // Очистим кнопки новых продуктов
          this.clearProductButtonsFromWindow();

          //Деактивируем кнопку для новых продуктов
          this.setModButtonForAddNewProduct('disable');

          //Поменяем надпись внутри данного input
          this.addProductInputEl.placeholder = "Добавьте новый товар в список...";

          //Уберем тень на заднем фоне
          this.setBackgroundShadow(false);
        }
      }
    });
  }

  setEventForClickNewProductButton() {
    /**
     * Добавляет обработчик события при клике на кнопку добавления нового продукта
     */
    this.addProductInputButtonEl.addEventListener('click', ({target}) => {

      if (target.tagName === "BUTTON") {

        //
        this.sendJSONNewProductToServer(this.getListId(), null, this.addProductInputEl.value);

        //Очистим поле ввода нового продукта
        this.clearNewProductInputValue();

        // Очистим кнопки новых продуктов
        this.clearProductButtonsFromWindow();

        //Деактивируем кнопку для новых продуктов
        this.setModButtonForAddNewProduct('disable');

        //Поменяем надпись внутри данного input
        this.addProductInputEl.placeholder = "Добавьте новый товар в список...";

        //Уберем тень на заднем фоне
        this.setBackgroundShadow(false);
      }


    })
  }

  getDictOfProductsForSubstring(substring) {
    /**
     * Найдет подстроку в названиях продуктов в объекте словаря типовых продуктов и вернем только те
     * свойства, в которых встречается переданная подстрока
     */
    return Object.fromEntries(
      Object.entries(this.receivedProductsDictObj)
        .filter(
          ([key, value]) => {
            let someValue = value.toLowerCase();
            let someSubstring = substring.toLowerCase();
            return someValue.includes(someSubstring);
          }
        )
    );
  }


  setEventForClickNewProductField() {
    /**
     * Добавляет событие клика по кнопкам продукта productChoiceEl и отправляет данные на сервер
     */


    this.productChoiceEl.addEventListener('click', ({target}) => {

      //Очистим поле ввода нового продукта
      this.clearNewProductInputValue();

      // Очистим кнопки новых продуктов
      this.clearProductButtonsFromWindow();
      if (target.tagName === "A") {

        this.sendJSONNewProductToServer(this.getListId(), target.dataset.productid, null);

        this.setModButtonForAddNewProduct('disable');

        //Уберем тень на заднем фоне
        this.setBackgroundShadow(false);

        //Поменяем надпись внутри данного input
        this.addProductInputEl.placeholder = "Добавьте новый товар в список...";
      }
    });

  }

  sendJSONNewProductToServer(listId, productId = null, productName = null) {
    /**
     * Отправляет данные о новом продукте на сервер, для его сохранения
     */

    if (productName == null) {

      // ------------ Конструкция асинхронного запроса ----------
      this.someAsyncPostResp(
        document.location.origin + "/api/v1/add_product_for_id/",
        {"listId": listId, "productId": productId, "quantity": ""}
      ).then(response => {
        response = JSON.parse(response)
        if (response.status === 'success') {

          // Дорисуем новый продукт в конец списка
          this.drawOneProductToEndListAndAddToObject(
            listId,
            response.newProductId,
            response.newProductName,
            response.newProductQuantity
          );
        } else {
          this.errorToConsole(response);
        }
      });
      // ------------------------------------------------------------
    }

    if (productId == null) {

      let {error, name, quantity} = this.stringProcessingForJSONValues(productName);

      if (!error) {
        // ------------ Конструкция асинхронного запроса ----------
        this.someAsyncPostResp(
          document.location.origin + "/api/v1/add_product_for_name/",
          {"listId": listId, "productName": name, "quantity": quantity}
        ).then(response => {
          response = JSON.parse(response)
          if (response.status === 'success') {
            // Дорисуем новый продукт в конец списка
            this.drawOneProductToEndListAndAddToObject(
              listId,
              response.newProductId,
              response.newProductName,
              response.newProductQuantity,
            );
          } else {
            this.errorToConsole(response);
          }
        });
        // ------------------------------------------------------------
      }


    }
  }

  stringProcessingForJSONValues(string) {
    /**
     * Обработает строку вида "название:количество", которую ввели при добавлении нового продукта
     * и вычленит из нее имя продукта количество если оно есть. Также посмотрит не пустое ли имя
     * продукта пришло к нам
     * @type {Array|*}
     */

    let i = string.indexOf(':');
    if (i !== -1) {
      let split_list = [string.slice(0, i), string.slice(i + 1)];

      // Уберем пробелы вначале и в конце строк в массиве
      split_list.forEach((el, id) => {
        el = el.trim()
        split_list[id] = el;
      });


      if (this.isEmpty(split_list[0])) {
        return {
          error: true,
          name: "",
          quantity: ""
        }
      } else {
        return {
          error: false,
          name: split_list[0],
          quantity: split_list[1]
        }
      }
    } else {
      string = string.trim();
      if (this.isEmpty(string)) {
        return {
          error: true,
          name: "",
          quantity: ""
        }
      } else {
        return {
          error: false,
          name: string,
          quantity: ""
        }
      }

    }


  }

  isEmpty(str) {
    /**
     * Проверит строку на пустоту
     */
    return str.trim() === '';
  }

  setEventForOutingFromNewProductInput() {
    /**
     * Уберет все кнопки, показанные при активации поля ввода новых продуктов
     */
    this.addProductInputEl.addEventListener('blur', ({target}) => {
      window.setTimeout(() => {
        this.clearProductButtonsFromWindow();

        //Поменяем надпись внутри данного input
        this.addProductInputEl.placeholder = "Добавьте новый товар в список...";

        //Уберем тень на заднем фоне
        this.setBackgroundShadow(false);

      }, 100);
    });
  }

  renderAdditionProductButtons(renderObj) {
    /**
     * Отрисовывает кнопки при вводе в поле новых продуктов,
     * которые являются ссылками для добавления новых продуктов в список
     * @type {string}
     */
    // this.clearProductButtonsFromWindow();
    if (Object.keys(renderObj).length !== 0) {
      let str = ``;

      Object.keys(renderObj).forEach(product_id => {
        str += `<a href="#" class="bblock" data-productid="${product_id}">${renderObj[product_id]}</a>`;
      });


      this.productChoiceEl.insertAdjacentHTML('beforeend', str);
    }
  }

  clearProductButtonsFromWindow() {
    /**
     * Очищает кнопки для добавления новых продуктов с экрана
     * @type {string}
     */
    this.productChoiceEl.innerHTML = "";
  }

  clearNewProductInputValue() {
    /**
     * Очищает ввод в поле ввода нового продукта
     * @type {string}
     */
    this.addProductInputEl.value = "";
  }

  setModButtonForAddNewProduct(mod = 'disable') {
    /**
     * Делает активной или не активной кнопку добавления нового продукта из поля ввода нового
     * продукта в зависимости от переданного аргумента в mod
     */
    if (mod === "able") {
      this.addProductInputButtonEl.classList.remove('disabled');
      this.addProductInputButtonEl.classList.remove('btn-outline-secondary');
      this.addProductInputButtonEl.classList.add('btn-primary');
    } else {
      this.addProductInputButtonEl.classList.add('disabled');
      this.addProductInputButtonEl.classList.add('btn-outline-secondary');
      this.addProductInputButtonEl.classList.remove('btn-primary');
    }
  }

  setBackgroundShadow(setMod = false) {
    if (setMod === true) {
      document.querySelector('#backgroundShadow').classList.add('shadow');
    } else {
      document.querySelector('#backgroundShadow').classList.remove('shadow');
    }
  }

  getListId() {
    /**
     * Получает id активного списка продуктов на странице
     * @type {number}
     */
    let list_id = 0;
    let productListsEl = document.querySelectorAll('#productLists a');
    productListsEl.forEach(el => {
      if (el.classList.contains('active')) {
        list_id = el.dataset.id;
      }
    })
    if (list_id) {
      return list_id
    } else {
      throw new Error(`Не удалось получить идентификатор списка продуктов пользователя`);
    }
  }

  //----------- Все, что связано с продуктами в конкретном списке --------------
  // ---------------------------------------------------------------------------

}