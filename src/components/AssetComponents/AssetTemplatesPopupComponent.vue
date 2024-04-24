<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { AssetSchema } from '../../plugins/interfaces';
import PageHeaderComponent from '../../components/GenericComponents/PageHeaderComponent.vue';
import Cacher from '../../plugins/Cacher';
import FullScreenPopupComponent from '../GenericComponents/FullScreenPopupComponent.vue';
import LoaderComponent from '../GenericComponents/LoaderComponent.vue';
import AssetTemplateComponent from './AssetTemplateComponent.vue';
import { deleteAssetTemplate, getAssetTemplates } from '../../plugins/dbCommands/assetManager';

let templates = ref([] as AssetSchema[])
let loading = ref(false)
let processingDelete = false

onMounted(()=>{
  loading.value = true
  getAssetTemplates(Cacher.getHttp(), (data, err)=>{
    if(err)
      return Cacher.errorHandler(err)
    templates.value = data as AssetSchema[]
    loading.value = false
  })
})

function deleteClicked(id:string) {
  if(processingDelete)
    return
  processingDelete = true
  deleteAssetTemplate(Cacher.getHttp(), id, (data, err)=>{
    processingDelete = false
    if(err)
      return Cacher.errorHandler(err)
    Cacher.messageHandler(data as string)
    templates.value.splice(templates.value.findIndex((temp)=>temp._id==id),1)
  })
}
</script>
<template>
  <FullScreenPopupComponent>
    <PageHeaderComponent class="mb-4">Asset Templates:</PageHeaderComponent>
    <LoaderComponent v-if="loading"/>
    <div v-else-if="templates.length>0">
      <AssetTemplateComponent v-for="template of templates" :asset="template"
        @load="$emit('load', template)"
        @delete="deleteClicked(template._id!)"
      />
    </div>
    <p v-else>
      No templates yet...
    </p>
  </FullScreenPopupComponent>
</template>
