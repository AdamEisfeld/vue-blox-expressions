<script lang="ts">

import { defineComponent, watch, reactive } from 'vue'
import { BloxComponent } from 'vue-blox'
import { BloxError } from 'vue-blox'
import { Parser } from 'expr-eval'
import { BloxPluginCompute } from '../src/classes/BloxPluginCompute'
import { BloxPluginEvent } from '../src/classes/BloxPluginEvent'

export default defineComponent({
	name: 'App',
	components: {
		BloxComponent,
	},
	props: {},
	setup() {

		// 1. Construct variables
		
		const variables: any = reactive({
			bar: 'Adam',
			foo: 'Tom',
			baz: 'Joey',
			score: 0,
			"msgSuccess": "You are not old enough for a seniors discount",
			"msgFailure": "Discount applied!",
			"a" : 1,
			"b": 2,
		})

		// 2. Construct view

		const view: any = {
			type: 'stack',
			'slot:children': [
				{
					type: 'button',
					'event:on:sendsomething': "console('User clicked!');",
					'bind:message': 'foo',
					'bind:count': 'score',
				},
				{
					type: 'button',
					'message': "1",
					'bind:count': 'score',
				}
			]
		}

		const parser = new Parser()
		parser.functions.pythagorean = (x: number, y: number) => {
			return Math.sqrt(x * x + y * y)
		}
		parser.functions.console = (message: any) => {
			console.log(message)
		}

		parser.functions.foo = (x: number) => {
			console.log(`clicked ${x}`)
		}
		parser.functions.bar = (x: number) => {
			console.log(`clicked again ${x}`)
		}

		watch(variables, () => {
			console.log('Changes have been made!')
		})

		const onError = (error: any) => {
			const bloxError = BloxError.asBloxError(error)
			if (bloxError) {
				console.log(bloxError.debugMessage)
			} else {
				console.log(error)
			}
		}

		const plugins = [
			new BloxPluginCompute(parser),
			new BloxPluginEvent(parser)
		]

		return {
			variables,
			view,
			onError,
			plugins,
		}
	},
})
</script>

<template>
	<main>
		<BloxComponent :view="view" :variables="variables" @on:error="onError" :plugins="plugins"/>
	</main>
</template>
