from sqlalchemy import Column, Integer, String, Date, Boolean, Float, Text, ForeignKey, Index, REAL
from sqlalchemy.orm import relationship
from .db import Base

class Team(Base):
    __tablename__ = "teams"
    
    team_id = Column(Integer, primary_key=True)
    team_city = Column(String, nullable=False)
    team_name = Column(String, nullable=False)
    team_short = Column(String, nullable=False)
    team_school_name = Column(String, nullable=False)
    team_fullname = Column(String, nullable=False)
    
    players = relationship("Player", back_populates="team")
    games_as_team_one = relationship("Game", foreign_keys="Game.team_one", back_populates="team_one_rel")
    games_as_team_two = relationship("Game", foreign_keys="Game.team_two", back_populates="team_two_rel")

class Player(Base):
    __tablename__ = "players"
    
    id = Column(Integer, primary_key=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    player_name = Column(String, nullable=False)
    team_id = Column(Integer, ForeignKey("teams.team_id"))
    
    team = relationship("Team", back_populates="players")
    game_stats = relationship("PlayerGameStats", back_populates="player")

class Game(Base):
    __tablename__ = "games"
    
    game_id = Column(String, primary_key=True)
    synergy_id = Column(String)
    date = Column(Date, nullable=False)
    season = Column(String, nullable=False)
    location = Column(String, nullable=False)
    team_one = Column(Integer, ForeignKey("teams.team_id", ondelete='CASCADE'))
    team_two = Column(Integer, ForeignKey("teams.team_id", ondelete='CASCADE'))
    team_one_score = Column(Integer, nullable=False)
    team_two_score = Column(Integer, nullable=False)
    winning_team = Column(String, nullable=False)
    overtime = Column(Boolean, default=False)
    comments = Column(Text)
    team_one_stats_id = Column(Integer, ForeignKey("team_game_stats.id", ondelete='SET NULL', onupdate='CASCADE'))
    team_two_stats_id = Column(Integer, ForeignKey("team_game_stats.id", ondelete='SET NULL', onupdate='CASCADE'))
    
    team_one_rel = relationship("Team", foreign_keys=[team_one])
    team_two_rel = relationship("Team", foreign_keys=[team_two])
    team_one_stats = relationship("TeamGameStats", foreign_keys=[team_one_stats_id])
    team_two_stats = relationship("TeamGameStats", foreign_keys=[team_two_stats_id])

    __table_args__ = (
        Index('games_team_one_stats_id_index', 'team_one_stats_id'),
        Index('games_team_two_stats_id_index', 'team_two_stats_id'),
    )

class PlayerGameStats(Base):
    __tablename__ = "player_game_stats"
    
    id = Column(Integer, primary_key=True)
    game_id = Column(String, ForeignKey("games.game_id", ondelete="CASCADE"))
    player_id = Column(Integer, ForeignKey("players.id", ondelete="CASCADE"))
    team_id = Column(Integer, ForeignKey("teams.team_id", ondelete="CASCADE"))
    mins = Column(Integer, nullable=False)
    fg3 = Column(Integer, nullable=False)
    fga3 = Column(Integer, nullable=False)
    fg2 = Column(Integer, nullable=False)
    fga2 = Column(Integer, nullable=False)
    fga = Column(Integer, nullable=False)
    ft = Column(Integer, nullable=False)
    fta = Column(Integer, nullable=False)
    fg = Column(Integer)
    fg_percent = Column(REAL)
    fg3_percent = Column(REAL, name="3pt_percent")
    fg2_percent = Column(REAL, name="2pt_percent")
    efg_percent = Column(REAL)
    ft_percent = Column(REAL)
    oreb = Column(Integer, nullable=False)
    dreb = Column(Integer, nullable=False)
    reb = Column(Integer, nullable=False)
    pf = Column(Integer, nullable=False)
    assist = Column(Integer, nullable=False)
    turn = Column(Integer, nullable=False)
    block = Column(Integer, nullable=False)
    steal = Column(Integer, nullable=False)
    points = Column(Integer, nullable=False)
    possessions = Column(Integer)
    
    player = relationship("Player", back_populates="game_stats")

class TeamGameStats(Base):
    __tablename__ = "team_game_stats"
    
    id = Column(Integer, primary_key=True)
    game_id = Column(String, ForeignKey("games.game_id", ondelete="CASCADE"))
    team_id = Column(Integer, ForeignKey("teams.team_id", ondelete="CASCADE"))
    team_name = Column(String, nullable=False)
    mins = Column(Integer, nullable=False)
    fg3 = Column(Integer, nullable=False)
    fga3 = Column(Integer, nullable=False)
    fg2 = Column(Integer, nullable=False)
    fga2 = Column(Integer, nullable=False)
    fga = Column(Integer, nullable=False)
    ft = Column(Integer, nullable=False)
    fta = Column(Integer, nullable=False)
    fg = Column(Integer)
    fg_percent = Column(REAL)
    fg3_percent = Column(REAL, name="3pt_percent")
    fg2_percent = Column(REAL, name="2pt_percent")
    efg_percent = Column(REAL)
    ft_percent = Column(REAL)
    oreb = Column(Integer, nullable=False)
    dreb = Column(Integer, nullable=False)
    reb = Column(Integer, nullable=False)
    pf = Column(Integer, nullable=False)
    assist = Column(Integer, nullable=False)
    turn = Column(Integer, nullable=False)
    block = Column(Integer, nullable=False)
    steal = Column(Integer, nullable=False)
    points = Column(Integer, nullable=False)
    possessions = Column(REAL(53))
    offrtg = Column(REAL(53))
    defrtg = Column(REAL(53))
    pace = Column(REAL(53))

class TeamSeasonStats(Base):
    __tablename__ = "team_season_stats"
    
    id = Column(Integer, primary_key=True)
    season = Column(String, nullable=False)
    team_one = Column(Integer, ForeignKey("teams.team_id", ondelete="CASCADE"))
    games_played = Column(Integer)
    wins = Column(Integer)
    mins = Column(Integer, nullable=False)
    fg3 = Column(Integer, nullable=False)
    fga3 = Column(Integer, nullable=False)
    fg2 = Column(Integer, nullable=False)
    fga2 = Column(Integer, nullable=False)
    fga = Column(Integer, nullable=False)
    ft = Column(Integer, nullable=False)
    fta = Column(Integer, nullable=False)
    fg = Column(Integer)
    fg_percent = Column(REAL)
    fg3_percent = Column(REAL, name="3pt_percent")
    fg2_percent = Column(REAL, name="2pt_percent")
    efg_percent = Column(REAL)
    ft_percent = Column(REAL)
    oreb = Column(Integer, nullable=False)
    dreb = Column(Integer, nullable=False)
    reb = Column(Integer, nullable=False)
    pf = Column(Integer, nullable=False)
    assist = Column(Integer, nullable=False)
    turn = Column(Integer, nullable=False)
    block = Column(Integer, nullable=False)
    steal = Column(Integer, nullable=False)
    points = Column(Integer, nullable=False)
    possessions = Column(REAL(53))
    offrtg = Column(REAL(53))
    defrtg = Column(REAL(53))
    offrtg_adj = Column(REAL(53))
    defrtg_adj = Column(REAL(53))
    pace = Column(REAL(53))
    poss_per_game = Column(REAL)

class PlayerSeasonStats(Base):
    __tablename__ = "player_season_stats"
    
    id = Column(Integer, primary_key=True)
    season = Column(String, nullable=False)
    team_id = Column(Integer, ForeignKey("teams.team_id", ondelete="CASCADE"))
    player_id = Column(Integer, ForeignKey("players.id", ondelete="CASCADE"))
    games_played = Column(Integer)
    mins = Column(Integer, nullable=False)
    fg3 = Column(Integer, nullable=False)
    fga3 = Column(Integer, nullable=False)
    fg2 = Column(Integer, nullable=False)
    fga2 = Column(Integer, nullable=False)
    fga = Column(Integer, nullable=False)
    ft = Column(Integer, nullable=False)
    fta = Column(Integer, nullable=False)
    fg = Column(Integer)
    fg_percent = Column(REAL)
    fg3_percent = Column(REAL, name="3pt_percent")
    fg2_percent = Column(REAL, name="2pt_percent")
    efg_percent = Column(REAL)
    ft_percent = Column(REAL)
    oreb = Column(Integer, nullable=False)
    dreb = Column(Integer, nullable=False)
    reb = Column(Integer, nullable=False)
    pf = Column(Integer, nullable=False)
    assist = Column(Integer, nullable=False)
    turn = Column(Integer, nullable=False)
    block = Column(Integer, nullable=False)
    steal = Column(Integer, nullable=False)
    points = Column(Integer, nullable=False)
    possessions = Column(Integer)

class PlayByPlay(Base):
    __tablename__ = "play_by_play"
    
    play_id = Column(String, primary_key=True)
    game_id = Column(String, nullable=False)
    season = Column(String, nullable=False)
    home_team = Column(String, nullable=False)
    away_team = Column(String, nullable=False)
    play_actor_team = Column(String)
    play_actor_player = Column(String)
    play_name = Column(String)
    description = Column(Text)
    shot = Column(Boolean, nullable=False, default=False)
    shot_result = Column(String)
    shot_quality = Column(REAL)
    shot_x = Column(REAL)
    shot_y = Column(REAL)
    quarter = Column(Integer, nullable=False)
    clock = Column(Integer)
    shotClock = Column(Integer)

    __table_args__ = (
        Index('play_by_play_game_id_play_actor_team_play_actor_player_index', 
              'game_id', 'play_actor_team', 'play_actor_player'),
    ) 