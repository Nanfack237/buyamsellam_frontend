<template>
  <v-app>
    <v-card>
      <v-layout>
        <SideBarComponent />
        <HeaderComponent />

        <v-main v-if="isDataLoaded" class="h-screen" style="min-height: max-content;">
          <v-row justify="space-between" class="d-flex justify-center px-5 py-5 pb-2">
            <v-col cols="auto">
              <p class="text-high-emphasis text-h6">
                {{ $t('userVue.user_list') }}
              </p>
            </v-col>

            <v-col cols="auto">
              <p class="text-right text-medium-emphasis">
                {{ formattedDate }}
              </p>
            </v-col>
            <v-divider class="border-opacity-100" color="grey-lighten-1"></v-divider>
          </v-row>

          <v-row justify="end" class="d-flex px-5 pt-2">
            <v-col cols="12" md="3" sm="6">
              <v-text-field
                v-model="search"
                :label="$t('userVue.search_by_name')"
                prepend-inner-icon="mdi-magnify"
                variant="solo-filled"
                flat
                hide-details
                single-line
              />
            </v-col>
          </v-row>

          <v-row class="px-7">
            <v-card elevation="4" width="3000" class="my-2 py-2 px-5">
              <p class="text-high-emphasis py-2">
                <b>{{ selectedUser.length || filteredUser.length }}</b>
                {{ (selectedUser?.length ?? 0) === 1 ? $t('user') : $t('users') }}
              </p>
              <v-divider class="border-opacity-100" color="grey-lighten-1"></v-divider>

              <v-data-table
                :items="filteredUser"
                :headers="headers"
                item-value="id"
                class="centered-headers"
                show-select
                v-model="selectedUser"
                return-object
                :sort-by="[{ key: 'id', order: 'desc' }]"
              >
                <template #item.index="{ index }">
                  {{ index + 1 }}
                </template>
                <template v-slot:item.image="{ item }">
                  <img
                    :src="getImageUrl(item.image)"
                    :alt="$t('userVue.user_photo')"
                    style="height: 50px; width: 50px; border-radius: 25px; object-fit: cover;"
                    class="my-1"
                  />
                </template>

                <template #item.created_at="{ item }">
                  {{ item.created_at ? item.created_at.slice(0, 10) : 'N/A' }}
                </template>
                <template #item.status="{ item }">
                  <v-icon :color="item.status === 1 ? 'green' : 'grey'" size="16" class="me-2">
                    mdi-check-circle
                  </v-icon>
                  <span>{{ item.status === 1 ? $t('active') : $t('inactive') }}</span>
                </template>

                <template v-slot:item.actions="{ item }">
                  <v-btn icon size="small" class="mx-2" color="warning" @click="openEditDialog(item)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>

                  <v-btn icon size="small" :title="$t('userVue.view_user')" class="mx-2" color="secondary" @click="viewUser(item)">
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
            </v-card>

            <v-row justify="end" class="my-1">
              <v-col cols="auto">
                <v-btn color="green-darken-2" variant="flat" :title="$t('userVue.download_excel_file')" @click="downloadExcel" class="mb-4 mx-2">
                  <v-icon>mdi-microsoft-excel</v-icon> {{ $t('userVue.excel') }}
                </v-btn>

                <v-btn color="secondary" @click="printUsers" class="mb-4">
                  <v-icon>mdi-printer</v-icon> {{ $t('userVue.print') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-row>

          <v-dialog v-model="editDialog" max-width="700px" persistent>
            <v-card>
              <v-card-title class="text-h5 text-center py-4">
                {{ isNewUser ? $t('userVue.add_user') : $t('userVue.edit_user') }}
              </v-card-title>
              <v-card-text>
                <v-form ref="userForm" @submit.prevent="saveUser">
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="editedItem.name"
                        :label="$t('userVue.name')"
                        :rules="[v => !!v || $t('userVue.name_required')]"
                        prepend-inner-icon="mdi-account"
                        variant="outlined"
                        class="mb-0"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="editedItem.email"
                        :label="$t('userVue.email')"
                        :rules="emailRules"
                        prepend-inner-icon="mdi-email"
                        variant="outlined"
                        class="mb-0"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="editedItem.store_limit"
                        :label="$t('userVue.store_limit')"
                       :rules="[v => !!v || $t('userVue.store_limit_required')]"
                        prepend-inner-icon="mdi-numeric"
                        variant="outlined"
                        class="mb-0"
                      ></v-text-field>
                    </v-col>
                   
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="editedItem.address"
                        :label="$t('userVue.address')"
                        :rules="[v => !!v || $t('userVue.address_required')]"
                        prepend-inner-icon="mdi-map-marker"
                        variant="outlined"
                        class="mb-0"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-select
                        v-model="editedItem.role"
                        :items="[
                          $t('userVue.cashier'),
                          $t('userVue.stock_controller'),
                          $t('userVue.staff')
                        ]"
                        :label="$t('userVue.role')"
                        :rules="[v => !!v || $t('userVue.role_required')]"
                        prepend-inner-icon="mdi-briefcase"
                        variant="outlined"
                        class="mb-0"
                      ></v-select>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-select
                        v-model="editedItem.status"
                        :items="[{ title: $t('active'), value: 1 }, { title: $t('inactive'), value: 0 }]"
                        :label="$t('userVue.status')"
                        :rules="[v => v !== null && v !== undefined || $t('userVue.status_required')]"
                        prepend-inner-icon="mdi-check-circle"
                        variant="outlined"
                        class="mb-0"
                      ></v-select>
                    </v-col>

                     <v-col cols="12" sm="12">
                      <v-text-field
                        v-model="editedItem.contact"
                        :label="$t('userVue.contact')"
                        :rules="contactRules"
                        prepend-inner-icon="mdi-phone"
                        variant="outlined"
                        class="mb-0"
                      ></v-text-field>
                    </v-col>
                    
                    <v-col cols="12">
                      <v-file-input
                        :label="$t('userVue.user_photo_optional')"
                        accept="image/*"
                        prepend-inner-icon=""
                        append-inner-icon="mdi-camera"
                        variant="outlined"
                        show-size
                        clearable
                        counter
                        :rules="imageUploadRules"
                        class="mb-2"
                        v-model="editedItem.imageFile"
                        @change="onFileSelected"
                        :hint="$t('userVue.max_2mb_image_types')"
                        persistent-hint
                      ></v-file-input>
                    </v-col>
                  </v-row>

                  <div v-if="editedItem.selectedImagePreview" class="image-preview-container mb-2">
                      <v-img :src="editedItem.selectedImagePreview" class="rounded-lg elevation-2" aspect-ratio="16/9" cover />
                  </div>
                  <div v-else-if="editedItem.originalImagePath" class="image-preview-container mb-2">
                      <v-img :src="getImageUrl(editedItem.originalImagePath)" class="rounded-lg elevation-2" aspect-ratio="16/9" cover />
                  </div>
                  <div v-else class="no-image-placeholder mb-4">
                      <v-icon size="80" color="grey-lighten-2">mdi-image-off-outline</v-icon>
                      <p class="text-caption text-grey-lighten-1 mt-2">{{ $t('userVue.no_photo_selected') }}</p>
                  </div>

                  <center>
                    <v-btn color="primary" type="submit" class="my-4 mx-1" :loading="loadingDialog">
                      {{ isNewUser ? $t('userVue.add_user') : $t('userVue.save_changes') }}
                    </v-btn>
                    <v-btn color="error" class="my-3 mx-1" @click="closeEditDialog">
                      {{ $t('userVue.cancel') }}
                    </v-btn>
                  </center>
                </v-form>
              </v-card-text>
            </v-card>
          </v-dialog>

          <div ref="printSection" class="d-none">
            <div class="report-container">
              <div class="watermark">BuyamSellam</div>
              <div class="report-header-section">
                <template v-if="userLogoUrl && userLogoUrl !== 'https://via.placeholder.com/60x60?text=No+Image'">
                  <img  src="@/assets/logo.jpg" alt="user Logo" class="report-logo">
                </template>
                <div class="user-info">
                  <h2 class="report-user-name">BuyamSellam</h2>
                  <p class="report-user-contact-info">{{ userAddress || 'BOCOM NDOBO' }} | +237 {{ userContact || 696923379}}</p>
                </div>
              </div>

              <div class="report-title-section">
                <h3 class="report-title">{{ $t('userVue.user_list') }}</h3>
                <p class="report-date">Date: {{ datePrint }}</p>
              </div>

              <div class="report-summary">
               <p>
                  {{ t('userVue.total_entries') }}: <b>{{ selectedUser.length }}</b> {{ selectedUser.length === 1 ? $t('user') : $t('users') }}
                </p>
              </div>

              <div class="report-table-section">
                <table class="report-table">
                  <thead>
                    <tr>
                      <th>SN</th>
                      <th>{{ $t('userVue.name') }}</th>
                      <th>{{ $t('userVue.email') }}</th>
                      <th>{{ $t('userVue.contact') }}</th>
                      <th>{{ $t('userVue.address') }}</th>
                      <th>{{ $t('userVue.role') }}</th>
                      <th>{{ $t('userVue.store_limit') }}</th>
                      <th>{{ $t('userVue.status') }}</th>
                      <th>{{ $t('userVue.date_created') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(user, index) in selectedUser" :key="user.id">
                      <td>{{ index + 1 }}</td>
                      <td>{{ user.name }}</td>
                      <td>{{ user.email }}</td>
                      <td>{{ user.contact }}</td>
                      <td>{{ user.address }}</td>
                      <td>{{ user.role }}</td>
                      <td>{{ user.store_limit }}</td>
                      <td>{{ user.status > 0 ? $t('active') : $t('inactive') }}</td>
                      <td>{{ new Date(user.created_at).toLocaleDateString() }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="report-footer-section">
              <p class="powered-by">{{ $t('userVue.powered_by') }}</p>
            </div>
          </div>

          <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="snackbarTimeout" location="top right">
            {{ snackbarMessage }}
          </v-snackbar>
          <AppFooter />
        </v-main>

        <v-overlay :model-value="!isDataLoaded" class="align-center justify-center" persistent>
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="my-1 text-h6 text-white">{{ $t('loading') }}</p>
        </v-overlay>

        <v-dialog v-model="showUserDialog" max-width="700">
          <v-card>
            <v-card-title class="d-flex align-center">
              {{ $t('userVue.user_details') }}
              <v-spacer></v-spacer>
              <v-btn icon flat @click="showUserDialog = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text v-if="currentUser">
              <v-row>
                <v-col cols="12" md="5" class="d-flex justify-content-center align-center">
                  <div class="inverted-rectangle-avatar elevation-4">
                    <v-img :src="getImageUrl(currentUser.image)" alt="Profile"></v-img>
                  </div>
                </v-col>
                <v-col cols="12" md="7">
                  <v-list density="compact">
                    <v-list-item>
                      <v-list-item-title class="font-weight-medium">{{ $t('userVue.name') }}:</v-list-item-title>
                      <v-list-item-subtitle>{{ currentUser.name }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="font-weight-medium">{{ $t('userVue.email') }}:</v-list-item-title>
                      <v-list-item-subtitle>{{ currentUser.email }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="font-weight-medium">{{ $t('userVue.contact') }}:</v-list-item-title>
                      <v-list-item-subtitle>{{ currentUser.contact }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="font-weight-medium">{{ $t('userVue.address') }}:</v-list-item-title>
                      <v-list-item-subtitle>{{ currentUser.address }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="font-weight-medium">{{ $t('userVue.role') }}:</v-list-item-title>
                      <v-list-item-subtitle>{{ currentUser.role }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="font-weight-medium">{{ $t('userVue.store_limit') }}:</v-list-item-title>
                      <v-list-item-subtitle>{{ currentUser.store_limit }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="font-weight-medium">{{ $t('userVue.status') }}:</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-chip :color="currentUser.status === 1 ? 'green' : 'grey'" label outlined small>
                          {{ currentUser.status === 1 ? $t('active') : $t('inactive') }}
                        </v-chip>
                      </v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="font-weight-medium">{{ $t('userVue.date_created') }}:</v-list-item-title>
                      <v-list-item-subtitle>{{ new Date(currentUser.created_at).toLocaleDateString() }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" @click="showUserDialog = false">{{ $t('userVue.close') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-layout>
    </v-card>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/axios';
import SideBarComponent from '@/components/admin/AdminSideBarComponent.vue';
import HeaderComponent from '@/components/admin/AdminHeaderComponent.vue';
import AppFooter from '@/components/AppFooter.vue';
import { useI18n } from 'vue-i18n';
// Removed 'import * as XLSX from 'xlsx';'

const { t, locale } = useI18n();

interface User {
  id: number | null;
  name: string;
  email: string;
  contact: string;
  address: string;
  role: string;
  store_limit: number | null;
  status: 0 | 1;
  image: string | null;
  created_at: string;
}

const users = ref<User[]>([]);
const search = ref<string>('');
const selectedUser = ref<User[]>([]);

const userEmail = ref<string>('');
const userContact = ref<string>('');
const userAddress = ref<string>('');
const userLogoUrl = ref<string>('');

const snackbar = ref<boolean>(false);
const snackbarMessage = ref<string>('');
const snackbarColor = ref<string>('');
const snackbarTimeout = 3000;

const isDataLoaded = ref<boolean>(false);

const printSection = ref<HTMLElement | null>(null);

const showUserDialog = ref<boolean>(false);
const currentUser = ref<User | null>(null);

const editDialog = ref<boolean>(false);
const userForm = ref<any>(null);
const loadingDialog = ref(false);

const editedItem = ref<User & { imageFile: File[] | null; selectedImagePreview: string | null; originalImagePath: string | null; }>({
  id: null,
  name: '',
  email: '',
  contact: '',
  address: '',
  role: '',
  store_limit: 1,
  status: 1,
  image: null,
  created_at: new Date().toISOString(),
  imageFile: null,
  selectedImagePreview: null,
  originalImagePath: null,
});

const isNewUser = computed(() => !editedItem.value.id);

const router = useRouter();

const formattedDate = computed(() => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(locale.value, options);
});

const datePrint = computed(() => {
  const date = new Date();
  // Using 'en-CA' or 'fr-CA' (Canadian English/French) often yields YYYY-MM-DD consistently.
  // Alternatively, you could use 'en-US' and then manually reverse the order if needed, but this is cleaner.
  return new Intl.DateTimeFormat(`${locale.value}-CA`, { // Or 'fr-CA' if you prefer French locale specifically for formatting
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
});

const filteredUser = computed<User[]>(() => {
  return users.value.filter(user => {
    return user.name.toLowerCase().includes(search.value.toLowerCase());
  });
});

const headers = computed (() => [
  { title: 'Profile', value: 'image', align: 'center' },
  { title: t('userVue.name'), value: 'name', align: 'center' },
  { title: t('userVue.email'), value: 'email', align: 'center' },
  { title: t('userVue.contact'), value: 'contact', align: 'center' },
  { title: t('userVue.address'), value: 'address', align: 'center' },
  { title: t('userVue.role'), value: 'role', align: 'center' },
  { title: t('userVue.store_limit'), value: 'store_limit', align: 'center' },
  { title: t('userVue.date_created'), value: 'created_at', align: 'center' },
  { title: t('userVue.status'), value: 'status', align: 'center' },
  { title: 'Actions', value: 'actions', align: 'center', sortable: false },
]);

const emailRules = [
  (v: string) => !!v || t('userVue.email_required'),
  (v: string) => /.+@.+\..+/.test(v) || t('userVue.email_must_be_valid'),
];

const contactRules = [
  (v: string) => !!v || t('userVue.contact_required'),
  (v: string) => /^\+?\d{6,15}$/.test(v) || t('userVue.contact_must_be_valid'),
];

const imageUploadRules = computed(() => [
  (v: File[] | null) => {
    if (!v || v.length === 0) return true;
    const file = v[0];
    const maxSize = 2 * 1024 * 1024; // 2 MB
    return file.size < maxSize || t('userVue.image_size_less_than_2mb');
  },
  (v: File[] | null) => {
    if (!v || v.length === 0) return true;
    const file = v[0];
    const allowedTypes = ['image/png', 'image/jpeg', 'image/bmp', 'image/gif', 'image/webp'];
    return allowedTypes.includes(file.type) || t('userVue.only_allowed_image_types');
  },
]);

function showSnackbar(message: string, color: string) {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}

const backendUrl = 'http://localhost:8000';

const getImageUrl = (imagePath: string | undefined | null) => {
  if (!imagePath) {
    return 'https://via.placeholder.com/60x60?text=No+Image';
  }
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // If your backend returns 'public/...'
  if (imagePath.startsWith('public/')) {
    // We replace 'public/' with 'storage/' because Laravel's storage link creates a 'public/storage' symlink.
    // It's common for files to be userd in storage/app/public and then accessed via /storage/
    const publicPath = imagePath.replace('public/', ''); // Remove 'public/'
    return `${backendUrl}/storage/${publicPath}`; // Append the correct public storage path
  }
  // Fallback for just filenames or if paths already include 'storage/'
  return `${backendUrl}/storage/${imagePath}`;
};

// const getImageUrl = (imagePath: string | null): string => {
//   if (!imagePath) {
//     return 'https://via.placeholder.com/150x80?text=No+Logo';
//   }
//   if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
//     return imagePath;
//   }
//   return `${backendUrl}/storage/${imagePath}`;
// };

async function fetchUsers() {
  try {
    const token = sessionStorage.getItem('access_token');

    if (!token) {
      showSnackbar(t('userVue.authentication_missing'), 'error');
      router.push('/login');
      return;
    }

    const response = await axios.get('/api/admin/userlist', {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    users.value = response.data.users;

  } catch (error: any) {
    console.error('Error fetching users:', error);
    showSnackbar(t('userVue.failed_to_load_users'), 'error');
  }
}

async function Me() {
  try {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      showSnackbar(t('userVue.authentication_missing'), 'error');
      return;
    }
    const response = await axios.get('/api/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    userEmail.value = response.data.user.email;
    userContact.value = response.data.user.contact;
    userAddress.value = response.data.user.address;
    userLogoUrl.value = getImageUrl(response.data.user.logo1);
  } catch (error) {
    console.error('Error fetching user details:', error);
  }
}

function viewUser(item: User) {
  currentUser.value = item;
  showUserDialog.value = true;
}

function openEditDialog(item: User | null = null) {
  if (item) {
    editedItem.value = {
      ...item,
      status: item.status === true || item.status === 1 ? 1 : 0,
      imageFile: null,
      selectedImagePreview: null,
      originalImagePath: item.image,
    };
  } else {
    Object.assign(editedItem.value, {
      id: null,
      name: '',
      email: '',
      contact: '',
      address: '',
      role: '',
      store_limt: 1,
      status: 1,
      image: null,
      created_at: new Date().toISOString(),
      imageFile: null,
      selectedImagePreview: null,
      originalImagePath: null,
    });
  }
  editDialog.value = true;
  nextTick(() => {
    if (userForm.value) {
      userForm.value.resetValidation();
    }
  });
}



const onFileSelected = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = input.files;

  editedItem.value.selectedImagePreview = null;

  if (files && files.length > 0) {
    const file = files[0];
    let isValidFile = true;

    for (const rule of imageUploadRules.value) {
      const result = rule([file]);
      if (typeof result === 'string') {
        showSnackbar(result, 'error');
        isValidFile = false;
        break;
      }
    }

    if (isValidFile) {
      editedItem.value.imageFile = [file];
      editedItem.value.selectedImagePreview = URL.createObjectURL(file);
    } else {
      editedItem.value.imageFile = null;
      editedItem.value.selectedImagePreview = null;
    }
  } else {
    editedItem.value.imageFile = null;
    editedItem.value.selectedImagePreview = null;
    if (!isNewUser.value) {
      editedItem.value.originalImagePath = null;
    }
    nextTick(() => {
      if (userForm.value) {
        userForm.value.resetValidation();
      }
    });
  }
};

function closeEditDialog() {
  editDialog.value = false;
  loadingDialog.value = false;
  Object.assign(editedItem.value, {
    id: null,
    name: '',
    email: '',
    contact: '',
    address: '',
    role: '',
    store_limt: 1,
    status: 1,
    image: null,
    created_at: new Date().toISOString(),
    imageFile: null,
    selectedImagePreview: null,
    originalImagePath: null,
  });
  if (userForm.value) {
    userForm.value.resetValidation();
  }
}

watch(editDialog, (newVal) => {
  if (!newVal) {
    closeEditDialog(); // Ensure full reset if dialog is closed by means other than the cancel button
  }
});

async function saveUser() {
  if (!userForm.value) {
    console.error("Form reference 'userForm' is null. Cannot validate.");
    showSnackbar(t('userVue.form_not_ready'), 'error');
    return;
  }

  const { valid } = await userForm.value.validate();
  if (!valid) {
    showSnackbar(t('userVue.please_correct_form_errors'), 'error');
    return;
  }
  
  loadingDialog.value = true;
  try {
    const formData = new FormData();

    formData.append('name', editedItem.value.name);
    formData.append('email', editedItem.value.email);
    formData.append('contact', editedItem.value.contact);
    formData.append('address', editedItem.value.address);
    formData.append('role', editedItem.value.role);
    formData.append('store_limit', editedItem.value.store_limit);
    formData.append('status', editedItem.value.status.toString());

    if (editedItem.value.imageFile && editedItem.value.imageFile.length > 0) {
      formData.append('image', editedItem.value.imageFile[0]);
    } else if (editedItem.value.originalImagePath === null && !isNewUser.value) {
      formData.append('image', 'CLEAR_IMAGE');
    }

    const token = sessionStorage.getItem('access_token');

    if (!token) {
      showSnackbar(t('userVue.authentication_missing'), 'error');
      loadingDialog.value = false;
      return;
    }

    let response;
    if (isNewUser.value) {
      response = await axios.post('/api/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
    } else {
      formData.append('_method', 'PUT');
      response = await axios.post(`/api/admin/user/edit/${editedItem.value.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
    }

    if (response.data.success) {
      showSnackbar(t('userVue.succes_to_save_user') || response.data.success, 'success');
      await fetchUsers();
      closeEditDialog();
    } else {
      showSnackbar(t('userVue.failed_to_save_user') || response.data.error, 'error');
    }
  } catch (error: any) {
    console.error('Error saving user:', error);
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join('; ');
        showSnackbar(`${t('userVue.validation_error')} ${errorMessages}`, 'error');
      } else if (error.response.data.message) {
        showSnackbar(`${t('userVue.error')}: ${error.response.data.message}`, 'error');
      } else {
        showSnackbar(t('userVue.an_api_error_occurred'), 'error');
      }
    } else {
      showSnackbar(t('userVue.unexpected_error_occurred'), 'error');
    }
  } finally {
    loadingDialog.value = false;
  }
}

/**
 * Downloads the selected user data as a CSV file.
 */
function downloadExcel() {
  if (selectedUser.value.length === 0) {
    showSnackbar(t('userVue.select_user_to_export'), 'error'); // Updated translation key
    return;
  }

  const headers = [
    t('userVue.sn'), // Updated translation key
    t('userVue.name'),
    t('userVue.email'),
    t('userVue.contact'),
    t('userVue.address'),
    t('userVue.role'),
    t('userVue.status'),
    t('userVue.date_hired') // Updated translation key
  ];

  const rows = selectedUser.value.map((user, index) => [
    index + 1, // SN
    user.name,
    user.email,
    user.contact,
    user.address,
    user.role,
    user.status === 1 ? t('active') : t('inactive'), // Use generic 'active'/'inactive' or specific 'userVue.active'
    new Date(user.created_at).toLocaleDateString()
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(field => {
      let value = String(field);
      // Handle commas, double quotes, newlines, and carriage returns in fields
      if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
        value = `"${value.replace(/"/g, '""')}"`; // Enclose in double quotes and escape existing double quotes
      }
      return value;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) { // Feature detection for HTML5 download attribute
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    // Use userVue.user_list for filename if appropriate, or a generic 'users'
    link.setAttribute('download', `${t('userVue.user_list')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar(t('userVue.user_list_exported_successfully'), 'success'); // Updated translation key
  } else {
    showSnackbar(t('userVue.browser_does_not_support_download'), 'error'); // Updated translation key
  }
}

/**
 * Prints the selected user data using a new window and embedded styles.
 */
function printUsers() {
  if (selectedUser.value.length === 0) {
    showSnackbar(t('userVue.select_user_to_print'), 'error');
    return;
  }

  nextTick(() => {
    if (!printSection.value) {
      console.warn('printSection is not ready for printing.');
      showSnackbar(t('userVue.print_section_not_ready'), 'error');
      return;
    }

    const printContent = printSection.value.innerHTML;
    const printWindow = window.open('', '_blank', 'width=900,height=700');

    const date = new Date().toLocaleDateString();
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${t('userVue.user_list')}_${date.replace(/\//g, '-')}</title>
            <style>
              /* Embedded Print Styles */
              body { font-family: Arial, sans-serif; padding: 10px; margin: 0; }
              .report-container { width: 100%; margin: 0 auto; padding: 0px; box-sizing: border-box; }
              
              .report-header-section {
                text-align: center;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-wrap: wrap;
                padding-bottom: 10px;
                border-bottom: 2px solid #eee;
              }
              .report-logo {
                max-width: 100px;
                max-height: 80px;
                margin-right: 20px;
                margin-bottom: 10px;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                filter: none !important;
              }
              .user-info {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
              }
              .report-user-name {
                font-size: 28px; 
                margin-bottom: 5px; 
                color: #333; 
                font-weight: bold; 
                text-align: left;
              }
              .report-user-contact-info {
                font-size: 14px;
                color: #777;
                margin-top: 0;
                line-height: 1.5;
                text-align: left;
              }

              .report-title-section { text-align: center; margin: 20px 0 15px 0; padding-top: 10px;}
              .report-title { font-size: 24px; margin-bottom: 10px; color: #444; font-weight: bold; }
              .report-date { font-size: 14px; color: #888; }

              .report-summary { margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed #eee; font-size: 14px; }
              .report-summary strong { color: #000; }
              
              .report-table-section { margin-bottom: 40px; margin-top: 20px; }
              .report-table { width: 100%; border-collapse: collapse; }
              .report-table th, .report-table td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 13px;}
              .report-table th { background-color: #f5f5f5; font-weight: bold; color: #333;}
              .report-table tbody tr:nth-child(even) { background-color: #f9f9f9; }

              .report-footer-section { 
               margin-top: 10px;
               position: fixed; 
               bottom: 0;
               left: 0;
               width: 100%;
               padding: 15px;
               text-align: center;
               z-index: 1000; 
               font-size: 8px; 
               color: #666;
             }
             .powered-by { font-style: italic; margin-top: 10px; }
              /* Image styles for print (for user photos within table) */
              .report-table img {
                height: 40px;
                width: 40px;
                object-fit: cover;
                border-radius: 50%;
                display: inline-block;
                vertical-align: middle;
              }
              .d-flex { display: flex; align-items: center; }
              
              .watermark {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%) rotate(-45deg);
                  font-size: 100px;
                  color: rgba(0, 0, 0, 0.08);
                  pointer-events: none;
                  user-select: none;
                  white-space: nowrap;
                  z-index: -8;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
              }

              /* Specific adjustments for print media */
              @media print {
                  body {
                      -webkit-print-color-adjust: exact !important;
                      print-color-adjust: exact !important;
                  }
                  .report-logo {
                      filter: none !important;
                  }
                  .report-table td {
                      word-wrap: break-word;
                      white-space: normal;
                  }
                  .report-footer-section {
                    position: static;
                    margin-top: 20mm;
                  }
              }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              };
            <\/script>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      showSnackbar(t('userVue.user_list_printed_successfully'), 'success');
    } else {
      showSnackbar(t('userVue.could_not_open_print_window'), 'error');
    }
  });
}

// --- Lifecycle Hooks ---
onMounted(async () => {
   
    await Promise.all([
        fetchUsers(),
        Me()
    ]);
    isDataLoaded.value = true;
});
</script>

<style scoped>
.centered-headers th {
  text-align: center !important;
}

/* Specific styles for the dialog image to ensure good fit */
.v-avatar img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

/* Adjust header alignment for better readability */
.v-data-table .v-data-table-header th {
  text-align: start;
}

/* Re-apply center alignment for specific columns if desired */
.v-data-table .v-data-table-header [aria-label="Photo"],
.v-data-table .v-data-table-header [aria-label="Status"],
.v-data-table .v-data-table-header [aria-label="Actions"] {
    text-align: center !important;
}

/* New style for the inverted rectangle avatar */
.inverted-rectangle-avatar {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.inverted-rectangle-avatar .v-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Styles for the image preview in the edit dialog */
.image-preview-container {
  max-height: 200px; /* Adjust height as needed */
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.no-image-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px; /* Keep consistent height with image-preview-container */
  background-color: #f5f5f5;
  border-radius: 8px;
  border: 1px dashed #ccc;
  color: #aaa;
  width: 100%; /* Ensure it takes full width of parent col */
}
</style>