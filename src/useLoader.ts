import { ref } from 'vue';

const isLoading = ref(false)

export function useLoader(){
    const startLoading = () => (isLoading.value = true);
    const stopLoading = () => (isLoading.value = false);

    return {
        isLoading,
        startLoading,
        stopLoading,
    }
}