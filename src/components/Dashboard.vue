<template lang="pug">
div
  form(
    v-on:submit.prevent="onFilterSubmit"
    class='row'
  )
    div(class='col-sm-6').hidden-print
      div(class='form-group row')
        label(
          class='col-xs-3 col-form-label'
          for='item-order-input'
        ) Order

        div(class='col-sm-6')
          select(
            id='item-order-input'
            class='form-control'
            placeholder='Order'
            v-model='itemOrder'
          )
            option(value='') Any
            option(
              v-for='(v, k) of itemOrderOptions'
              v-bind:value='k'
            ) {{ v }}

    div(
      class='form-group col-md-6'
    ).hidden-print
      div(class='btn-group')
        button(
          type="submit"
          class="btn btn-primary"
          v-bind:disabled='loading'
        ) Submit

        button(
          class="btn btn-secondary"
          v-bind:disabled='loading'
          v-on:click.prevent='clearFilters()'
        ) Clear filters



  div(
    v-if='loading'
    class='my-1 h1 text-xs-center'
  )
    i(class='fa fa-spin fa-circle-o-notch')

  div(
    v-else
  )
    div(
      v-if='!companies.length'
      class="alert alert-warning"
      role="alert"
    ) No results found.

    div(
      v-if='companies.length'
    )
      div(
        class='text-xs-center'
      )
        div.hidden-print
          | Showing
          | page
          | {{ page }}
          | of
          | {{ pages }}
          | ,
          | {{ ((page - 1) * itemsPerPage) + 1 }}
          | -
          | {{ (page * itemsPerPage) > totalItems ? totalItems : (page * itemsPerPage) }}
          | of
          | {{ totalItems }}
          | items

        ul(class='pagination pagination-sm').hidden-print
          li(
            class='page-item'
            v-bind:class='{ disabled: page == 1 }'
          )
            a(
              class='page-link'
              v-on:click.prevent='paginate(1)'
              href='#'
            )
              i(class='fa fa-angle-double-left')

          li(
            class='page-item'
            v-bind:class='{ disabled: page == 1 }'
          )
            a(
              class='page-link'
              v-on:click.prevent='paginate(page - 1)'
              href='#'
            )
              i(class='fa fa-angle-left')

          li(
            v-for='n in getPaginationRange()'
            class='page-item'
            v-bind:class='{ active: page == n }'
          )
            a(
              class='page-link'
              v-on:click.prevent='paginate(n)'
              href='#'
            ) {{ n }}

          li(
            class='page-item'
            v-bind:class='{ disabled: (page >= pages) }'
          )
            a(
              class='page-link'
              v-on:click.prevent='paginate(page + 1)'
              href='#'
            )
              i(class='fa fa-angle-right')

          li(
            class='page-item'
            v-bind:class='{ disabled: (page >= pages) }'
          )
            a(
              class='page-link'
              v-on:click.prevent='paginate(pages)'
              href='#'
            )
              i(class='fa fa-angle-double-right')

      div(
        class='card card-top-blue card-block'
        v-for='item in companies'
      )
        div
          h5
            span(
              class='tag tag-default'
            ) {{ item.id }}
            | &nbsp;
            | {{ item.name }}

          p(class='btn-group')
            a(
              class='btn btn-secondary btn-sm'
              data-toggle='collapse'
              href='#'
              v-bind:data-target='".item-description-" + item.id'
              v-if='item.description'
            ) Toggle description

          div(
            class='collapse'
            v-bind:class='"item-description-" + item.id'
          )
            div(
              class='card card-block'
              v-html='item.description'
            )

      div(class='text-xs-center')
        ul(class='pagination pagination-sm')
          li(
            class='page-item'
            v-bind:class='{ disabled: page == 1 }'
          )
            a(
              class='page-link'
              v-on:click.prevent='paginate(1)'
              href='#'
            )
              i(class='fa fa-angle-double-left')

          li(
            class='page-item'
            v-bind:class='{ disabled: page == 1 }'
          )
            a(
              class='page-link'
              v-on:click.prevent='paginate(page - 1)'
              href='#'
            )
              i(class='fa fa-angle-left')

          li(
            v-for='n in getPaginationRange()'
            class='page-item'
            v-bind:class='{ active: page == n }'
          )
            a(
              class='page-link'
              v-on:click.prevent='paginate(n)'
              href='#'
            ) {{ n }}

          li(
            class='page-item'
            v-bind:class='{ disabled: (page >= pages) }'
          )
            a(
              class='page-link'
              v-on:click.prevent='paginate(page + 1)'
              href='#'
            )
              i(class='fa fa-angle-right')

          li(
            class='page-item'
            v-bind:class='{ disabled: (page >= pages) }'
          )
            a(
              class='page-link'
              v-on:click.prevent='paginate(pages)'
              href='#'
            )
              i(class='fa fa-angle-double-right')
</template>

<script>
import { mapState } from 'vuex'
import * as types from '../store/mutation-types'


export default {
  name: 'dashboard',

  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (!vm.initialized) {
        vm.initialized = true
        vm.reloadData()
      }
    })
  },

  data () {
    return {
      // Init state
      initialized: false,

      // filters
      itemOrder: '',
      itemOrderOptions: {
        'id': 'ID',
        '-id': 'ID (Descending)',
        'created_at': 'Creation Date',
        '-created_at': 'Creation Date (Descending)',
      },
      clearFilters: () => {
        this.itemOrder = ''
      },
      onFilterSubmit: () => {
        this.page = 1
        this.reloadData()
      },

      // paging
      page: 1,
      pages: 1,
      itemsPerPage: 25,
      totalItems: 0,
      loading: false,
      getPaginationRange: () => {
        // Max amount of pagination links shown
        var maxItems = 29

        // First pagination link's page
        var startPage = this.page - Math.floor(maxItems / 2)

        if (startPage < 1) {
          startPage = 1
        }

        // Last pagination link's page
        var lastPage = startPage + (maxItems - 1)

        if (lastPage > this.pages) {
          lastPage = this.pages
        }

        // If we don't have enough pages (due to being at the last page for instance),
        // move starting page backward if we can
        var requiredPages = maxItems - ((lastPage - startPage) + 1)
        if (requiredPages > 0) {
          startPage -= requiredPages

          if (startPage < 1) {
            startPage = 1
          }
        }

        // Generate page range
        var pages = []
        for (var i = startPage; i <= lastPage; i++) {
          pages.push(i)
        }

        return pages
      },
      paginate: (page) => {
        // Do nothing if we're on the right page
        if (page == this.page) {
          return
        }

        window.scrollTo(0, 0)
        this.page = page
        this.reloadData()
      },

      // data
      companies: [],

      parseItem: (item) => {
        item._parsed = {
        }
      },

      parseItems: () => {
        this.companies.forEach((item) => {
          this.parseItem(item)
        })
      },

      reloadData: () => {
        if (this.loading) {
          return
        }

        this.loading = true

        var params = {
          page: this.page,
        }

        if (this.itemOrder) {
          params.order_by = this.itemOrder
        }

        this.$store.dispatch(types.NINETOFIVER_API_REQUEST, {
          path: '/companies/',
          params: params,
        }).then((response) => {
          this.loading = false
          this.totalItems = response.data.count
          this.pages = Math.ceil(this.totalItems / this.itemsPerPage)
          this.companies = response.data.results

          this.parseItems()
        }, () => {
          this.loading = false
        })
      },
    }
  }
}
</script>

<style>
</style>
