
import type { BloxPluginInterface } from 'vue-blox'
import { BloxError } from 'vue-blox'
import type { Parser } from 'expr-eval'
import { toRaw } from 'vue'

/**
 * A key plugin that searches for keys that start with 'on:' and prepares the resulting prop to be a function that invokes the evaluation of the value string
 * when the event is emitted from the component
 */
class BloxPluginEmit implements BloxPluginInterface {

	parser: Parser

	constructor(parser: Parser) {
		parser.functions.internal_invokeFunctions = (...inFunctions: Function[]) => {
			return () => {
				for (let f = 0; f < inFunctions.length; f += 1) {
					const fn = inFunctions[f]
					fn()
				}
			}
		}
		this.parser = parser
	}

	run(key: string, value: any, variables: any, setProp: (key: string, value: any) => void, setSlot: (slotName: string, views: any[]) => void ): void {
	
		const emitSpecifier = 'on:'
		if (!key.startsWith(emitSpecifier)) {
			return undefined
		}

		// This is an emit prop. 

		// 1. Get the prop name
		const eventName = key.substring(emitSpecifier.length, key.length)
		if (eventName.length === 0) {
			throw new BloxError(
				'Emit parsing failed.',
				`The value for the prop name for emit must be a string with length > 0.`,
				{
					key, value
				}
			)
		}

		const toCamelCase = (str: string): string => {
			let words = str.split(/[^a-zA-Z0-9]/);
			let camelCase = words[0].toLowerCase();
			for (let i = 1; i < words.length; i++) {
				camelCase += words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
			}
			return camelCase;
		}

		// 2. The value for the key is the value we want to evaluate when the event is emitted
		const expressionString = value
		if (/^__proto__|prototype|constructor$/.test(expressionString)) {
			throw new BloxError(
				'Expression parsing failed.',
				`The call to parser.evaluate() for value ${value} was aborted because prototype access was detected.`,
				undefined
			)
		}

		// 3. Construct getter / setter props for v-bind
		const unreactiveVariables = {}
		Object.assign(unreactiveVariables, toRaw(variables))

		setProp(toCamelCase(`on_${eventName}`), (...args: any[]) => {

			// Push the args from the emit event into unreactiveVariables so they can be referenced in the expression
			Object.assign(unreactiveVariables, args)
			
			try {
				this.parser.evaluate(expressionString, unreactiveVariables)
			} catch(error) {
				throw new BloxError(
					'Expression parsing failed.',
					`The call to parser.evaluate() for value ${value} threw the error: ${error}`,
					undefined
				)
			}

		})
		
	}

}

function getPluginEmit({ parser }: { parser: Parser }): BloxPluginEmit {
	return new BloxPluginEmit(parser)
}

export {
	BloxPluginEmit,
	getPluginEmit
}
