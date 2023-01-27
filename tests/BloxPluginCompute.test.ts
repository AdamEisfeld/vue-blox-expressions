import { test, expect } from 'vitest'
import { BloxPluginCompute } from '../src/classes/BloxPluginCompute'
import { Parser } from 'expr-eval'
import { BloxContext } from 'vue-blox'

test('Compute plugin does nothing when specifier not provided', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginCompute(parser)
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

	expect(context.props['foo:message']).toBeUndefined()

})

test('Compute plugin renders simple expression', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginCompute(parser)
	const context = new BloxContext()

	// When

	plugin.run({
		context: context,
		key: 'compute:message',
		value: '1 + 1',
		variables: {},
		buildContext: () => {
			return undefined
		}
	})

	// Then

	expect(context.props.message).toEqual(2)

})


test('Compute plugin renders simple expression with undefined variables', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginCompute(parser)
	const context = new BloxContext()

	// When

	plugin.run({
		context: context,
		key: 'compute:message',
		value: '1 + 1',
		variables: undefined,
		buildContext: () => {
			return undefined
		}
	})

	// Then

	expect(context.props.message).toEqual(2)

})

test('Compute plugin can reference variables', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginCompute(parser)
	const context = new BloxContext()

	// When

	plugin.run({
		context: context,
		key: 'compute:message',
		value: 'x * y',
		variables: {
			x: 2,
			y: 4
		},
		buildContext: () => {
			return undefined
		}
	})

	// Then

	expect(context.props.message).toEqual(8)

})

test('Compute plugin emits error with invalid evaluation string', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginCompute(parser)
	const context = new BloxContext()

	// When

	let error: any = undefined

	try {
		plugin.run({
			context: context,
			key: 'compute:message',
			value: 'should fail',
			variables: undefined,
			buildContext: () => {
				return undefined
			}
		})

	} catch(thrownError) {
		error = thrownError
	}

	// Then

	expect(error).toBeDefined()
	expect(error?.message).toContain('The call to parser.evaluate()')

})

test('Compute plugin emits error with empty prop name', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginCompute(parser)
	const context = new BloxContext()

	// When

	let error: any = undefined

	try {
		plugin.run({
			context: context,
			key: 'compute:',
			value: 'x * y',
			variables: {
				x: 2,
				y: 4
			},
			buildContext: () => {
				return undefined
			}
		})
	} catch(thrownError) {
		error = thrownError
	}

	// Then

	expect(error).toBeDefined()
	expect(error?.message).toContain('The value for the prop name for compute must be a string with length > 0.')

})

test('Compute plugin emits error when attempting to use prototype pollution exploit', async () => {

	// Given

	const parser = new Parser()
	const plugin = new BloxPluginCompute(parser)
	const context = new BloxContext()

	// When

	let error: any = undefined

	try {
		plugin.run({
			context: context,
			key: 'compute:message',
			value: '__proto__',
			variables: {
				x: 2,
				y: 4
			},
			buildContext: () => {
				return undefined
			}
		})
	} catch(thrownError) {
		error = thrownError
	}

	// Then

	expect(error).toBeDefined()
	expect(error?.message).toContain('prototype access was detected')

})