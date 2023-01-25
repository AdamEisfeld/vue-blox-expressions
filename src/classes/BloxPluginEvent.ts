
import type { BloxPluginInterface } from 'vue-blox'
import { BloxError } from 'vue-blox'
import type { Parser } from 'expr-eval'

/**
 * A plugin that searches for keys that start with 'event:' and prepares the resulting prop to be a function that invokes the evaluation of the value string
 * when the event is emitted from the component
 */
class BloxPluginEvent implements BloxPluginInterface {

	parser: Parser

	constructor(parser: Parser) {
		this.parser = parser
	}

	run(key: string, value: any, variables: any, setProp: (key: string, value: any) => void, setSlot: (slotName: string, views: any[]) => void ): { key: string, value: any } {
	
		const emitSpecifier = 'event:'
		if (!key.startsWith(emitSpecifier)) {
			return { key, value }
		}

		// This is an event prop. 

		// 1. Get the event name
		const eventName = key.substring(emitSpecifier.length, key.length)
		if (eventName.length === 0) {
			throw new BloxError(
				'Emit parsing failed.',
				`The value for the prop name for event must be a string with length > 0.`,
				{ key, value }
			)
		}

		// 2. The value for the key is the value we want to evaluate when the event is emitted
		const expressionString = value

		const formattedEventName = `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`

		// 3. Construct getter / setter props for v-bind
		const unreactiveVariables = JSON.parse(JSON.stringify(variables ?? {}))
		
		setProp(formattedEventName, (...args: any[]) => {

			if (/^__proto__|prototype|constructor$/.test(expressionString)) {
				throw new BloxError(
					'Expression parsing failed.',
					`The call to parser.evaluate() for value ${value} was aborted because prototype access was detected.`,
					{ key, value }
				)
			}

			// Push the args from the emit event into unreactiveVariables so they can be referenced in the expression
			Object.assign(unreactiveVariables, args)
			
			try {
				this.parser.functions.setVariable = (key: string, value: any) => {
					variables[key] = value
				}
				this.parser.evaluate(expressionString, unreactiveVariables)
			} catch(error) {
				throw new BloxError(
					'Expression parsing failed.',
					`The call to parser.evaluate() for value ${value} threw the error: ${error}`,
					{ key, value }
				)
			}

		})

		return {
			key: eventName,
			value: value
		}
		
	}

}

function getPluginEvent({ parser }: { parser: Parser }): BloxPluginEvent {
	return new BloxPluginEvent(parser)
}

export {
	BloxPluginEvent,
	getPluginEvent
}
