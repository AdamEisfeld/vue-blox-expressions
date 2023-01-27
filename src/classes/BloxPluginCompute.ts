
import type { BloxPluginInterface, BloxContext } from 'vue-blox'
import type { Parser } from 'expr-eval'

/**
 * A key plugin that searches for keys that start with 'on:' and prepares the resulting prop to be a function that invokes the evaluation of the value string
 * when the event is emitted from the component
 */
class BloxPluginCompute implements BloxPluginInterface {

	parser: Parser

	constructor(parser: Parser) {
		this.parser = parser
	}

	run({ context, key, value, variables, buildContext }: { context: BloxContext, key: string, value: any, variables: any, buildContext: ({ view, variables }: { view: any, variables: any }) => BloxContext | undefined }) {	

		const computeSpecifier = 'compute:'
		if (!key.startsWith(computeSpecifier)) {
			return
		}

		// This is an emit prop. 

		// 1. Get the prop name
		const propName = key.substring(computeSpecifier.length, key.length)
		if (propName.length === 0) {
			throw new Error(`The value for the prop name for compute must be a string with length > 0.`)
		}

		// 2. The value for the key is the value we want to evaluate when the event is emitted
		const expressionString = value
		if (/^__proto__|prototype|constructor$/.test(expressionString)) {
			throw new Error(`The call to parser.evaluate() for value ${value} was aborted because prototype access was detected.`)
		}

		// 3. Construct getter / setter props for v-bind

		const unreactiveVariables = JSON.parse(JSON.stringify(variables ?? {}))

		try {
			const result = this.parser.evaluate(expressionString, unreactiveVariables)
			context.setProp({
				propName: propName,
				value: result
			})
		} catch(error) {
			throw new Error(`The call to parser.evaluate() for value ${value} threw the error: ${error}`)
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
