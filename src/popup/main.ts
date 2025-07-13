import { mount } from 'svelte';
import Popup from '../lib/components/Popup.svelte';
import '../lib/utils/arrow-navigation';
import './popup.css';

const target = document.getElementById('popup');
if (!target) {
  throw new Error('Could not find app container');
}

mount(Popup, { target });
