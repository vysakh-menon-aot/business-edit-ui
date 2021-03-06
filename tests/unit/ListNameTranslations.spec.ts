// Libraries
import Vue from 'vue'
import Vuelidate from 'vuelidate'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import mockRouter from './MockRouter'

// Store
import { getVuexStore } from '@/store'

// Utils
import { createLocalVue, mount } from '@vue/test-utils'

// Components
import { ListNameTranslation } from '@/components/YourCompany'
import flushPromises from 'flush-promises'
import { NameTranslationDraftIF } from '@/interfaces'

Vue.use(Vuetify)
Vue.use(Vuelidate)

const vuetify = new Vuetify({})
const store = getVuexStore()
document.body.setAttribute('data-app', 'true')

function resetStore (): void {
  store.state.stateModel.nameTranslations = []
}

// Local references
const nameTranslationsUi = '#name-translations-list'
const nameTranslationsList: NameTranslationDraftIF[] = [
  { value: 'First mock name translation ltd.' },
  { value: 'Second mock name translation inc' },
  { value: 'Third mock name translation ltd.' },
  { value: 'Quatrième nom simulé' }
]

describe('List Name Translation component', () => {
  let wrapperFactory: any

  beforeEach(() => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const router = mockRouter.mock()

    // Init Store
    store.state.stateModel.nameTranslations = []

    wrapperFactory = (propsData) => {
      return mount(ListNameTranslation, {
        localVue,
        router,
        store,
        vuetify,
        propsData: { ...propsData }
      })
    }
  })

  it('displays the list of name translations and action btns', async () => {
    const wrapper = wrapperFactory({ translationList: nameTranslationsList })
    await flushPromises()

    // Verify list exists
    expect(wrapper.find(nameTranslationsUi).exists()).toBeTruthy()

    // Verify list title
    expect(wrapper.find('.name-translation-title').text()).toContain('Name Translations')

    // Verify list items
    const namesList = wrapper.vm.$el.querySelectorAll('.names-translation-content')
    expect(namesList[0].textContent).toContain(nameTranslationsList[0].value)
    expect(namesList[1].textContent).toContain(nameTranslationsList[1].value)
    expect(namesList[2].textContent).toContain(nameTranslationsList[2].value)
    expect(namesList[3].textContent).toContain(nameTranslationsList[3].value)

    // Verify edit btn and default state
    expect(wrapper.find('.edit-action .v-btn').exists()).toBeTruthy()
    expect(wrapper.find('.edit-action .v-btn').attributes('disabled')).toBeUndefined()

    // Verify more actions drop down
    expect(wrapper.find('.actions__more-actions__btn').exists()).toBeTruthy()
    wrapper.find('.actions__more-actions__btn').trigger('click')

    await Vue.nextTick()

    // Verify 'Remove' btn
    expect(wrapper.find('.actions__more-actions').exists()).toBeTruthy()

    wrapper.destroy()
  })

  it('disables the edit and drop down btns when editing a name translation', async () => {
    const wrapper = wrapperFactory({ translationList: nameTranslationsList, isAddingNameTranslation: true })
    await Vue.nextTick()

    // Verify edit btn and default state
    expect(wrapper.find('.edit-action .v-btn').exists()).toBeTruthy()
    expect(wrapper.find('.edit-action .v-btn').attributes('disabled')).toBeTruthy()

    // Verify more actions drop down
    expect(wrapper.find('.actions__more-actions__btn').exists()).toBeTruthy()
    expect(wrapper.find('.actions__more-actions__btn').attributes('disabled')).toBeTruthy()
    wrapper.find('.actions__more-actions__btn').trigger('click')

    await Vue.nextTick()

    // Verify 'Remove' btn
    expect(wrapper.find('.actions__more-actions').exists()).toBeFalsy()

    wrapper.destroy()
  })

  it('emits the correct name index when selected for edit', async () => {
    const wrapper = wrapperFactory({ translationList: nameTranslationsList })
    await Vue.nextTick()

    const namesList = wrapper.vm.$el.querySelectorAll('.names-translation-content')
    expect(namesList[0].textContent).toContain(nameTranslationsList[0].value)
    expect(namesList[1].textContent).toContain(nameTranslationsList[1].value)
    expect(namesList[2].textContent).toContain(nameTranslationsList[2].value)
    expect(namesList[3].textContent).toContain(nameTranslationsList[3].value)

    const editBtns = wrapper.findAll('.edit-action .v-btn')

    // Select the first name to edit
    editBtns.at(0).trigger('click')
    expect(wrapper.emitted('editNameTranslation').pop()).toEqual([0])

    // Select the third name to edit
    editBtns.at(2).trigger('click')
    expect(wrapper.emitted('editNameTranslation').pop()).toEqual([2])

    wrapper.destroy()
  })

  it('emits the correct name index when selected for removal', async () => {
    const wrapper = wrapperFactory({ translationList: nameTranslationsList })
    await Vue.nextTick()

    const namesList = wrapper.vm.$el.querySelectorAll('.names-translation-content')
    expect(namesList[0].textContent).toContain(nameTranslationsList[0].value)
    expect(namesList[1].textContent).toContain(nameTranslationsList[1].value)
    expect(namesList[2].textContent).toContain(nameTranslationsList[2].value)
    expect(namesList[3].textContent).toContain(nameTranslationsList[3].value)

    // Open the first list item dropdown
    const actionsDropdown = wrapper.findAll('.actions__more-actions__btn')
    actionsDropdown.at(0).trigger('click')

    await Vue.nextTick()

    // Select the first item for removal
    const removeBtns = wrapper.findAll('.actions__more-actions .v-list-item')
    expect(removeBtns.at(0).exists()).toBeTruthy()
    expect(removeBtns.at(0).attributes('disabled')).toBeUndefined()
    removeBtns.at(0).trigger('click')

    expect(wrapper.emitted('removeNameTranslation').pop()).toEqual([0])

    wrapper.destroy()
  })
})
