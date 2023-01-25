<script lang="ts">
import { defineComponent} from 'vue'

export default defineComponent({
	name: 'TestButtonComponent',
	components: {},
	props: undefined,
	emits: [
		'clicked'
	],
	setup(props, { emit }) {
		const onClick = () => {
			emit('clicked')
		}
		return {
			onClick
		}
	},
})

</script>
	
<template>
	<button ref="clickMe" class="clickMe" id="clickMe" @click="onClick">
	</button>
</template>
