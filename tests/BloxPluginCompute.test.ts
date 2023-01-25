import { test, expect } from 'vitest'
import { BloxPluginCompute } from '../src/classes/BloxPluginCompute'
import { BloxError } from 'vue-blox'
import { Parser } from 'expr-eval'

test('Compute plugin does nothing when specifier not provided', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginCompute(parser)

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

test('Compute plugin renders simple expression', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginCompute(parser)

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

	plugin.run('compute:message', '1 + 1', {}, setProp, setSlot)

	// Then

	expect(computedProps.message).toBe(2)

})


test('Compute plugin renders simple expression with undefined variables', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginCompute(parser)

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

	plugin.run('compute:message', '1 + 1', undefined, setProp, setSlot)

	// Then

	expect(computedProps.message).toBe(2)

})

test('Compute plugin can reference variables', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginCompute(parser)

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

	plugin.run('compute:message', 'x * y', {
		x: 2,
		y: 4
	}, setProp, setSlot)

	// Then

	expect(computedProps.message).toBe(8)

})

test('Compute plugin emits error with invalid evaluation string', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginCompute(parser)

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
		plugin.run('compute:message', 'should fail', {
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
	expect(bloxError?.debugMessage).toContain('The call to parser.evaluate()')
	expect(bloxError?.context?.key).toEqual('compute:message')
	expect(bloxError?.context?.value).toEqual('should fail')

})

test('Compute plugin emits error with empty prop name', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginCompute(parser)

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
		plugin.run('compute:', '1 + 1', {
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
	expect(bloxError?.debugMessage).toContain('The value for the prop name for compute must be a string with length > 0.')
	expect(bloxError?.context?.key).toEqual('compute:')
	expect(bloxError?.context?.value).toEqual('1 + 1')

})

test('Compute plugin emits error when attempting to use prototype pollution exploit', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginCompute(parser)

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
		plugin.run('compute:name', '__proto__', {
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
	expect(bloxError?.debugMessage).toContain('prototype access was detected')
	expect(bloxError?.context?.key).toEqual('compute:name')
	expect(bloxError?.context?.value).toEqual('__proto__')

})