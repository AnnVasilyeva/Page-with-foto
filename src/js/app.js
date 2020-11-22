class ApiService {
    constructor() {
        this.serverURL = 'https://json.medrating.org/';
    }

    async getUsers() {
        const users = await fetch(`${this.serverURL}users/`);
        return users.json();
    }

    async getAlbums(userId) {
        const albums = await fetch(`${this.serverURL}albums?userId=${userId}`);
        return albums.json();
    }

    async getPhotos(albumId) {
        const photos = await fetch(`${this.serverURL}photos?albumId=${albumId}`);
        return photos.json();
    }

}

class Catalog {
    constructor(api) {
        this.api = api;
        this.users = this.api.getUsers();
        this.container = document.querySelector('.main_container');
        this.favoritePhotos = this.getLocalFavorites();
    }

    closeContainer() {
        this.container.innerHTML = '';
    }

    getLocalFavorites() {
        if(localStorage.photos) {
            return JSON.parse(localStorage.photos);
        }
        return [];
    }

    showCatalog() {
        this.container.innerHTML = '';

        const catalog = document.createElement('ul');
        catalog.classList.add('catalog');

        this.users.then((users) => {
            users.forEach(user => {
                const userItem = document.createElement('li');
                userItem.classList.add('catalog_item');
                userItem.classList.add('user_item');

                userItem.innerHTML = ` <div class="user_name">${user.name}</div>
                                    <ul class="user_album_list"></ul>`;

                catalog.appendChild(userItem);

                const albumsList = userItem.querySelector('.user_album_list');

                userItem.querySelector('.user_name').onclick = () => {
                    userItem.classList.toggle('open');
                    this.openItem(user.id, userItem, albumsList, 'albums');
                }
            })

            this.container.appendChild(catalog);
        })

    }


    showAlbums(albums, list) {

        albums.forEach(album => {
            const albumItem = document.createElement('li');
            albumItem.classList.add('catalog_item');
            albumItem.classList.add('user_album');

            albumItem.innerHTML = `<div class="album_name">${album.title}</div>
                                    <ul class="user_photo_list"></ul>`;

            list.appendChild(albumItem);

            const photosList = albumItem.querySelector('.user_photo_list');

            albumItem.querySelector('.album_name').onclick = () => {
                albumItem.classList.toggle('open');
                this.openItem(album.id, albumItem, photosList, 'photos');
            }

        })
    }

    showPhotos(photos, list) {

        photos.forEach(photo => {

            const photoItem = document.createElement('li');
            photoItem.classList.add('user_photo');
            photoItem.innerHTML = `<div class="star ${this.favoritePhotos.find(item => photo.id === item.id) ? 'star_checked' : ''}"></div>
                                    <div class="photo">
                                        <img src="${photo.url}" title="${photo.title}" alt="${photo.title}">
                                        <div class="photo_title ${list.classList.contains('user_photo_list') ? 'hidden' : ''}">${photo.title}</div>
                                    </div>`;

            list.appendChild(photoItem);

            photoItem.querySelector('.photo').onclick = () => {
                const bigPhoto = document.createElement('div');
                bigPhoto.classList.add('photo_big');
                bigPhoto.innerHTML = `<img src="${photo.url}" title="${photo.title}" alt="${photo.title}">`;

                this.container.appendChild(bigPhoto);

                bigPhoto.onclick = () => {
                    bigPhoto.remove();
                }
            }

            const star =  photoItem.querySelector('.star');

            star.onclick = () => {
                star.classList.toggle('star_checked');

                if(star.classList.contains('star_checked')) {
                    this.favoritePhotos.push(photo);
                    localStorage.photos = JSON.stringify(this.favoritePhotos);

                } else {
                    const index = this.favoritePhotos.findIndex(item => item.id === photo.id);
                    this.favoritePhotos.splice(index, 1);
                    localStorage.photos = JSON.stringify(this.favoritePhotos);

                    if(list.classList.contains('favorite')) {
                        photoItem.remove();
                    }
                }

            }
        })
    }

    createFavorite() {
        this.container.innerHTML = '';

        const favoriteList = document.createElement('ul');
        favoriteList.classList.add('favorite');
        this.container.appendChild(favoriteList);

        this.showPhotos(JSON.parse(localStorage.photos), favoriteList);

    }


    openItem(id, item, itemList, name) {
        if (item.classList.contains('open')) {
            let response;

            if(name === 'albums') {
                response = this.api.getAlbums(id);
                response.then((data) => {
                    this.showAlbums(data, itemList);
                });
            } else if(name === 'photos') {
                response = this.api.getPhotos(id);
                response.then((data) => {
                    this.showPhotos(data, itemList);
                });
            }

        } else {
            itemList.innerHTML = '';
        }

    }

}

const apiService = new ApiService();
const catalog = new Catalog(apiService);

const catalogBtn = document.querySelector('.menu_item_catalog'),
      favoriteBtn = document.querySelector('.menu_item_favorite');

catalogBtn.addEventListener('click', () => {
    catalogBtn.classList.toggle('item_catalog_open');

    if(catalogBtn.classList.contains('item_catalog_open')) {
        favoriteBtn.classList.remove('item_favorite_open');
        catalog.showCatalog();
    } else {
        catalog.closeContainer();
    }

});

favoriteBtn.addEventListener('click', () => {
    favoriteBtn.classList.toggle('item_favorite_open');
    if(favoriteBtn.classList.contains('item_favorite_open') && localStorage.photos) {
        catalogBtn.classList.remove('item_catalog_open');
        catalog.createFavorite();
    } else {
        catalog.closeContainer();
    }

});