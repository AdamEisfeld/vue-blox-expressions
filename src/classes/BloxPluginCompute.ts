
import type { BloxPluginInterface } from 'vue-blox'
import { BloxError } from 'vue-blox'
import type { Parser } from 'expr-eval'
import { toRaw } from 'vue'

/**
 * A key plugin that searches for keys that start with 'on:' and prepares the resulting prop to be a function that invokes the evaluation of the value string
 * when the event is emitted from the component
 */
class BloxPluginCompute implements BloxPluginInterface {

	parser: Parser

	constructor(parser: Parser) {
		this.parser = parser
	}

	run(key: string, value: any, variables: any, setProp: (key: string, value: any) => void, setSlot: (slotName: string, views: any[]) => void ): void {

		const computeSpecifier = 'compute:'
		if (!key.startsWith(computeSpecifier)) {
			return
		}

		// This is an emit prop. 

		// 1. Get the prop name
		const propName = key.substring(computeSpecifier.length, key.length)
		if (propName.length === 0) {
			throw new BloxError(
				'Compute parsing failed.',
				`The value for the prop name for compute must be a string with length > 0.`,
				{
					key, value
				}
			)
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

		try {
			const result = this.parser.evaluate(expressionString, unreactiveVariables)
			setProp(propName, result)
		} catch(error) {
			throw new BloxError(
				'Expression parsing failed.',
				`The call to parser.evaluate() for value ${value} threw the error: ${error}`,
				undefined
			)
		}
		
	}

}

function getPluginCompute({ parser }: { parser: Parser }): BloxPluginCompute {
	return new BloxPluginCompute(parser)
}

export {
	BloxPluginCompute,
	getPluginCompute
}
