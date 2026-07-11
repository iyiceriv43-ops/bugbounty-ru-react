import { Link } from 'react-router-dom'

export default function Footer({ onBusinessModal }) {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <span className="footer-logo">HackPark</span>
          <p>Bug Bounty платформа от HackPark.</p>
          <div className="footer-socials">
            <a href="#">Telegram</a><a href="#">VK</a><a href="#">GitHub</a><a href="#">Habr</a>
          </div>
        </div>
        <div className="footer-cols">
<div className="footer-col"><h4>Платформа</h4><Link to="/#programs">Программы</Link><Link to="/#leaders">Лидерборд</Link><Link to="/#how">Как это работает</Link><a href="#">Правила</a></div>
            <div className="footer-col"><h4>Бизнесу</h4><a href="#" onClick={(e) => { e.preventDefault(); onBusinessModal?.() }}>Запустить программу</a><a href="#">Тарифы</a><a href="#">Документы</a></div>
            <div className="footer-col"><h4>Исследователям</h4><Link to="/register">Регистрация</Link><Link to="/#faq">FAQ</Link><a href="#">Гайдлайн</a><a href="#">Блог</a></div>
          <div className="footer-col"><h4>Правовое</h4><a href="#">Условия</a><a href="#">Конфиденциальность</a><a href="#">Cookie</a><a href="#">Safe Harbor</a></div>
        </div>
      </div>
      <div className="footer-bottom"><p>© 2026 HackPark · Все права защищены</p><p>Казань · Россия</p></div>
    </footer>
  )
}
