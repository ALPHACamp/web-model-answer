const request = require('supertest')
const sinon = require('sinon')
const { response } = require('express')
const proxyquire = require('proxyquire')

describe('# F2-3_BackEnd A1', () => {
	const restaurant = { 
		results: [
			{ id: 1, name: 'foo', category: 'bar' },
			{ id: 2, name: 'bar', category: 'foo' },
			{ id: 3, name: 'bar', category: 'bar' }
		]
	}
	let target = proxyquire('../app', { './restaurant.json': restaurant })
	let render
	let redirect

	beforeEach(() => {
		render = sinon.spy(response, 'render')
		redirect = sinon.spy(response, 'redirect')
	})

	afterEach(() => {
		render.restore()
		redirect.restore()
	})

	describe('GET "/"', () => {
		it('should return rendered response', (done) => {
			request(target)
				.get('/')
				.end(() => {
					sinon.assert.calledOnceWithMatch(render, 'index', { restaurantsData: restaurant.results })
					done()
				})
		})
	})

	describe('GET "/search"', () => {
		it('with no query string [keywords], should redirect to "/"', (done) => {
			request(target)
				.get('/search')
				.end(() => {
					sinon.assert.calledOnceWithExactly(redirect, '/')
					sinon.assert.notCalled(render)
					done()
				})
		})
		it('with query string [keywords], should return filtered rendered resposne', (done) => {
			const query = { keywords: 'foo' }
			const filteredRestaurants = [
				{ id: 1, name: 'foo', category: 'bar' },
				{ id: 2, name: 'bar', category: 'foo' },
			]

			request(target)
				.get('/search')
				.query(query)
				.end(() => {
					sinon.assert.notCalled(redirect)
					sinon.assert.calledOnceWithMatch(render, 'index', { restaurantsData: filteredRestaurants, keywords: query.keywords })
					done()
				})
		})
	})

	describe('Get /restaurants', () => {
		it('should return specific rendered restaurant response', (done) => {
			const key = 1
			const restaurant = { id: 1, name: 'foo', category: 'bar' }

			request(target)
				.get('/restaurants/1')
				.end(() => {
					sinon.assert.calledOnceWithMatch(render, 'show', { restaurantData: restaurant })
					done()
				})
		})
	})
})