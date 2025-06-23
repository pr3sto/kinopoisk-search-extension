import { mount } from 'svelte';
import './global.css';
import Popup from './lib/components/Popup.svelte';

const target = document.getElementById('popup');
if (!target) {
  throw new Error('Could not find app container');
}

mount(Popup, { target });
