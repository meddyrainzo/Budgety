'use strict';

const PagedResult = function(currentPage, resultsPerPage, items, totalItems) {
  this.totalItems = resultsPerPage;
  this.items = items;
  this.totalResults = totalItems;
  const numberOfPages = Math.ceil(totalItems / resultsPerPage);
  this.numberOfPages = Math.ceil(totalItems / resultsPerPage);
  this.currentPage = currentPage < numberOfPages ? currentPage : numberOfPages;
};

module.exports = PagedResult;
