import { mount } from 'svelte';
import Popup from './lib/components/Popup.svelte';
import './styles/global.css';

const target = document.getElementById('popup');
if (!target) {
  throw new Error('Could not find app container');
}

mount(Popup, { target });
