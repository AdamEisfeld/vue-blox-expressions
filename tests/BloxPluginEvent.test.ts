import { test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { BloxComponent, BloxContext } from 'vue-blox'
import { BloxPluginEvent } from '../src/classes/BloxPluginEvent'
import { reactive } from 'vue'
import { Parser } from 'expr-eval'
import TestButtonComponent from './TestButtonComponent.vue'

test('Event plugin does nothing when specifier not provided', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginEvent(parser)
	const context = new BloxContext()

	// When

	plugin.run({
		context: context,
		key: 'foo:message',
		value: '1 + 1',
		variables: {},
		buildContext: () => {
			return undefined
		}
	})

	// Then

	expect(context.props.foo).toBeUndefined()

})

test('Event plugin wires simple event', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginEvent(parser)
	const context = new BloxContext()

	// When

	plugin.run({
		context: context,
		key: 'event:clicked',
		value: 'doSomething()',
		variables: {},
		buildContext: () => {
			return undefined
		}
	})

	// Then

	expect(typeof context.props['onClicked']).toEqual('function')

})

test('Event plugin wires camelCase event', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginEvent(parser)
	const context = new BloxContext()

	// When

	plugin.run({
		context: context,
		key: 'event:didClick',
		value: 'doSomething()',
		variables: {},
		buildContext: () => {
			return undefined
		}
	})

	// Then

	expect(typeof context.props['onDidClick']).toEqual('function')

})

test('Event plugin wires event with undefined variables', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginEvent(parser)
	const context = new BloxContext()

	// When

	plugin.run({
		context: context,
		key: 'event:didClick',
		value: 'doSomething()',
		variables: undefined,
		buildContext: () => {
			return undefined
		}
	})

	// Then

	expect(typeof context.props['onDidClick']).toEqual('function')

})

test('Clicked event is fired and function is invoked', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginEvent(parser)

	const variables = reactive({
		didClick: false
	})

	const catalog = {
		'button' : TestButtonComponent
	}

	const view = {
		'type': 'button',
		'event:clicked': 'setVariable("didClick", true)'
	}
	
	// When

	const wrapper = mount(BloxComponent, {
		props: {
			catalog: catalog,
			view: view,
			variables: variables,
			plugins: [plugin],
		},
	})

	const button = wrapper.findComponent(TestButtonComponent)
	button.trigger('click')
	await wrapper.vm.$nextTick()

	// Then

	expect(variables.didClick).toBeTruthy()

})

test('Event plugin emits error with invalid evaluation string', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginEvent(parser)

	const variables = reactive({
		didClick: false
	})

	const catalog = {
		'button' : TestButtonComponent
	}

	const view = {
		'type': 'button',
		'event:clicked': 'shouldFail()'
	}
	
	// When

	let thrownError: any = undefined

	const wrapper = mount(BloxComponent, {
		props: {
			catalog: catalog,
			view: view,
			variables: variables,
			plugins: [plugin],
		},
		global: {
			config: {
				errorHandler: (error) => {
					thrownError = error
				}
			}
		}
	})

	const button = wrapper.findComponent(TestButtonComponent)
	button.trigger('click')
	await wrapper.vm.$nextTick()

	// Then

	expect(thrownError).toBeDefined()
	expect(thrownError?.message).toContain('The call to parser.evaluate()')

})

test('Event plugin emits error with empty event name', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginEvent(parser)
	const context = new BloxContext()

	// When

	let thrownError: any = undefined

	try {
		plugin.run({
			context: context,
			key: 'event:',
			value: 'doSomething()',
			variables: {},
			buildContext: () => {
				return undefined
			}
		})
	} catch(error) {
		thrownError = error
	}

	// Then

	expect(thrownError).toBeDefined()
	expect(thrownError?.message).toContain('The value for the prop name for event must be a string with length > 0.')

})

test('Event plugin emits error when attempting to use prototype pollution exploit', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginEvent(parser)

	const variables = reactive({
		didClick: false
	})

	const catalog = {
		'button' : TestButtonComponent
	}

	const view = {
		'type': 'button',
		'event:clicked': '__proto__()'
	}
	
	// When

	let thrownError: any = undefined

	const wrapper = mount(BloxComponent, {
		props: {
			catalog: catalog,
			view: view,
			variables: variables,
			plugins: [plugin],
		},
		global: {
			config: {
				errorHandler: (error) => {
					thrownError = error
				}
			}
		}
	})

	const button = wrapper.findComponent(TestButtonComponent)
	button.trigger('click')
	await wrapper.vm.$nextTick()

	// Then

	expect(thrownError).toBeDefined()
	expect(thrownError?.message).toContain('The call to parser.evaluate()')

})
