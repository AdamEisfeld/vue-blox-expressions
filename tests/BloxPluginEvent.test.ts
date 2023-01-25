import { test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { BloxComponent } from 'vue-blox'
import { BloxPluginEvent } from '../src/classes/BloxPluginEvent'
import { reactive } from 'vue'
import { BloxError } from 'vue-blox'
import { Parser } from 'expr-eval'
import TestButtonComponent from './TestButtonComponent.vue'

test('Event plugin does nothing when specifier not provided', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginEvent(parser)

	let didSetProp: boolean = false
	let didSetSlot: boolean = false

	const setProp = (propName: string, value: any) => {
		didSetProp = true
	}

	const setSlot = (slotName: string, views: any[]) => {
		didSetSlot = true
	}

	// When

	plugin.run('foo:message', '1 + 1', {}, setProp, setSlot)

	// Then

	expect(didSetProp).toBeFalsy()
	expect(didSetSlot).toBeFalsy()

})

test('Event plugin wires simple event', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginEvent(parser)

	const computedProps: Record<string, any> = {}
	const computedSlots: Record<string, any[]> = {}
	
	const setProp = (propName: string, value: any) => {
		if (value) {
			computedProps[propName] = value
		} else {
			delete computedProps[propName]
		}
	}

	const setSlot = (slotName: string, views: any[]) => {
		computedSlots[slotName] = views
	}

	// When

	plugin.run('event:clicked', 'doSomething()', {}, setProp, setSlot)

	// Then

	expect(typeof computedProps['onClicked']).toEqual('function')

})

test('Event plugin wires camelCase event', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginEvent(parser)

	const computedProps: Record<string, any> = {}
	const computedSlots: Record<string, any[]> = {}
	
	const setProp = (propName: string, value: any) => {
		if (value) {
			computedProps[propName] = value
		} else {
			delete computedProps[propName]
		}
	}

	const setSlot = (slotName: string, views: any[]) => {
		computedSlots[slotName] = views
	}

	// When

	plugin.run('event:didClick', 'doSomething()', {}, setProp, setSlot)

	// Then

	expect(typeof computedProps['onDidClick']).toEqual('function')

})

test('Event plugin wires event with undefined variables', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginEvent(parser)

	const computedProps: Record<string, any> = {}
	const computedSlots: Record<string, any[]> = {}
	
	const setProp = (propName: string, value: any) => {
		if (value) {
			computedProps[propName] = value
		} else {
			delete computedProps[propName]
		}
	}

	const setSlot = (slotName: string, views: any[]) => {
		computedSlots[slotName] = views
	}

	// When

	plugin.run('event:clicked', 'doSomething()', undefined, setProp, setSlot)

	// Then

	expect(typeof computedProps['onClicked']).toEqual('function')

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

	const bloxError = BloxError.asBloxError(thrownError)

	// Then

	expect(thrownError).toBeDefined()
	expect(bloxError).toBeDefined()
	expect(bloxError?.debugMessage).toContain('The call to parser.evaluate()')
	expect(bloxError?.context?.key).toEqual('event:clicked')
	expect(bloxError?.context?.value).toEqual('shouldFail()')

})

test('Event plugin emits error with empty event name', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginEvent(parser)

	const computedProps: Record<string, any> = {}
	const computedSlots: Record<string, any[]> = {}
	
	const setProp = (propName: string, value: any) => {
		if (value) {
			computedProps[propName] = value
		} else {
			delete computedProps[propName]
		}
	}

	const setSlot = (slotName: string, views: any[]) => {
		computedSlots[slotName] = views
	}

	// When

	let error: any = undefined

	try {
		plugin.run('event:', '1 + 1', {
			x: 2,
			y: 4
		}, setProp, setSlot)
	} catch(thrownError) {
		error = thrownError
	}

	const bloxError = BloxError.asBloxError(error)

	// Then

	expect(error).toBeDefined()
	expect(bloxError).toBeDefined()
	expect(bloxError?.debugMessage).toContain('The value for the prop name for event must be a string with length > 0.')
	expect(bloxError?.context?.key).toEqual('event:')
	expect(bloxError?.context?.value).toEqual('1 + 1')

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

	const bloxError = BloxError.asBloxError(thrownError)

	// Then

	expect(thrownError).toBeDefined()
	expect(bloxError).toBeDefined()
	expect(bloxError?.debugMessage).toContain('The call to parser.evaluate()')
	expect(bloxError?.context?.key).toEqual('event:clicked')
	expect(bloxError?.context?.value).toEqual('__proto__()')

})
